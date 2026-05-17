import { defineEventHandler, readRawBody, getHeader, createError } from 'h3'
import Stripe from 'stripe'
import prisma from '../../db/prisma'
import { fulfillPaidOrder } from '../../utils/orderFulfillment'
import { sendGa4PurchaseForOrder } from '../../utils/ga4'
import { ensureMarketplaceCommissionForOrder } from '../../utils/marketplaceCommission'

function getStripeClient() {
  const key = String(process.env.STRIPE_SECRET_KEY || '').trim()
  if (!key) {
    throw createError({ statusCode: 500, statusMessage: 'STRIPE_SECRET_KEY não configurado' })
  }
  return new Stripe(key, {
    apiVersion: '2026-02-25.clover'
  })
}

export default defineEventHandler(async (event) => {
  const stripe = getStripeClient()
  const sig = getHeader(event, 'stripe-signature')
  if (!sig) {
    throw createError({ statusCode: 400, statusMessage: 'Missing Stripe signature' })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw createError({ statusCode: 500, statusMessage: 'STRIPE_WEBHOOK_SECRET não configurado' })
  }

  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Missing raw body' })
  }

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Stripe signature' })
  }

  async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
    const orderId = String((pi.metadata as any)?.orderId || '').trim()
    if (!orderId) {
      console.warn('[stripe/webhook] payment_intent.succeeded: no orderId in metadata, pi.id=', pi.id)
      return
    }

    console.log('[stripe/webhook] payment_intent.succeeded orderId=', orderId, 'pi=', pi.id)

    const paidAt = new Date()
    const availableAt = new Date(paidAt.getTime() + 7 * 24 * 60 * 60 * 1000)

    if (String(process.env.AFFILIATE_ENABLED || '').trim().toLowerCase() === 'true') {
      try {
        const affiliateCode = String((pi.metadata as any)?.affiliate || '').trim()
        if (affiliateCode) {
          const affiliate = await (prisma as any).affiliate.findUnique({
            where: { code: affiliateCode },
            select: { id: true, commissionRate: true }
          })
          if (affiliate) {
            const existing = await (prisma as any).affiliateCommission.findFirst({
              where: { orderId, affiliateId: affiliate.id },
              select: { id: true }
            })
            if (!existing) {
              const order = await (prisma as any).order.findUnique({
                where: { id: orderId },
                select: { totalAmount: true }
              })
              const totalAmount = Number((order as any)?.totalAmount ?? 0)
              const commissionRate = Number((affiliate as any)?.commissionRate ?? 0)
              const amount = Math.round(totalAmount * commissionRate * 100) / 100
              if (amount > 0) {
                await (prisma as any).affiliateCommission.create({
                  data: { orderId, affiliateId: affiliate.id, amount, availableAt },
                  select: { id: true }
                })
                await (prisma as any).order.update({
                  where: { id: orderId },
                  data: { affiliateId: affiliate.id },
                  select: { id: true }
                })
              }
            }
          }
        }
      } catch {
        // ignore affiliate errors
      }
    }

    await (prisma as any).order.update({
      where: { id: orderId },
      data: { status: 'PAID', pagoEm: paidAt, stripePaymentIntentId: pi.id },
      select: { id: true }
    })

    try { await ensureMarketplaceCommissionForOrder(orderId) } catch { /* ignore */ }
    try { await sendGa4PurchaseForOrder(orderId, 'stripe') } catch { /* ignore */ }

    await fulfillPaidOrder(orderId)
    console.log('[stripe/webhook] payment_intent.succeeded fulfilled orderId=', orderId)
  }

  async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    console.log('[stripe/webhook] checkout.session.completed session.id=', session.id)

    // Buscar o orderId via metadata da sessão ou via PaymentIntent
    let orderId = String((session.metadata as any)?.orderId || '').trim()

    if (!orderId && session.payment_intent) {
      const piId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id
      const pi = await stripe.paymentIntents.retrieve(piId)
      orderId = String((pi.metadata as any)?.orderId || '').trim()
      console.log('[stripe/webhook] checkout.session resolved orderId via PI=', orderId)
    }

    if (!orderId) {
      console.warn('[stripe/webhook] checkout.session.completed: no orderId found, session.id=', session.id)
      return
    }

    // Verificar se o pedido já foi pago (idempotência)
    const existing = await (prisma as any).order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true }
    })
    if (!existing) {
      console.warn('[stripe/webhook] checkout.session: order not found orderId=', orderId)
      return
    }
    if (existing.status === 'PAID') {
      console.log('[stripe/webhook] checkout.session: order already PAID, skipping orderId=', orderId)
      return
    }

    const paidAt = new Date()
    const piId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent as any)?.id || null

    await (prisma as any).order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        pagoEm: paidAt,
        ...(piId ? { stripePaymentIntentId: piId } : {})
      },
      select: { id: true }
    })

    try { await ensureMarketplaceCommissionForOrder(orderId) } catch { /* ignore */ }
    try { await sendGa4PurchaseForOrder(orderId, 'stripe') } catch { /* ignore */ }

    await fulfillPaidOrder(orderId)
    console.log('[stripe/webhook] checkout.session.completed fulfilled orderId=', orderId)
  }

  try {
    if (stripeEvent.type === 'payment_intent.succeeded') {
      await handlePaymentIntentSucceeded(stripeEvent.data.object as Stripe.PaymentIntent)
    } else if (stripeEvent.type === 'checkout.session.completed') {
      await handleCheckoutSessionCompleted(stripeEvent.data.object as Stripe.Checkout.Session)
    } else {
      console.log('[stripe/webhook] unhandled event type:', stripeEvent.type)
    }

    return { received: true }
  } catch (err: any) {
    console.error('[stripe/webhook] processing error:', err?.message || err)
    throw createError({ statusCode: 500, statusMessage: err?.message || 'Webhook processing failed' })
  }
})
