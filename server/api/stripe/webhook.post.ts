import { defineEventHandler, readRawBody, getHeader, createError } from 'h3'
import Stripe from 'stripe'
import prisma from '#root/server/db/prisma'
import { fulfillPaidOrder } from '#root/server/utils/orderFulfillment'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
})

export default defineEventHandler(async (event) => {
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

  try {
    if (stripeEvent.type === 'payment_intent.succeeded') {
      const pi = stripeEvent.data.object as Stripe.PaymentIntent
      const orderId = String((pi.metadata as any)?.orderId || '').trim()

      if (String(process.env.AFFILIATE_ENABLED || '').trim().toLowerCase() === 'true') {
        try {
          const affiliateCode = String((pi.metadata as any)?.affiliate || '').trim()
          if (affiliateCode && orderId) {
            const affiliate = await (prisma as any).affiliate.findUnique({
              where: { refCode: affiliateCode },
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
                    data: {
                      orderId,
                      affiliateId: affiliate.id,
                      amount
                    },
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
          // ignore
        }
      }

      if (orderId) {
        await (prisma as any).order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            pagoEm: new Date(),
            stripePaymentIntentId: pi.id
          },
          select: { id: true }
        })

        await fulfillPaidOrder(orderId)
      }
    }

    return { received: true }
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: err?.message || 'Webhook processing failed' })
  }
})
