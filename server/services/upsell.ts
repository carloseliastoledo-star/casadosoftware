/**
 * Upsell 1-click — cobra o cartão já utilizado no pedido original
 * Suporta Stripe (off_session PaymentIntent) e Pagar.me (card_token)
 */
import Stripe from 'stripe'
import { createPagarmeUpsell } from './pagarme'
import type { PagarmeCustomer } from './pagarme'
import prisma from '#root/server/db/prisma'
import { getStoreContext } from '#root/server/utils/store'
import { fulfillPaidOrder } from '#root/server/utils/orderFulfillment'
import { ensureMarketplaceCommissionForOrder } from '#root/server/utils/marketplaceCommission'
import type { H3Event } from 'h3'

function getStripe() {
  const key = String(process.env.STRIPE_SECRET_KEY || '').trim()
  if (!key) throw new Error('STRIPE_SECRET_KEY não configurado')
  return new Stripe(key, { apiVersion: '2025-12-15.clover' as any })
}

export async function createUpsellOrder(opts: {
  event: H3Event
  parentOrderId: string
  upsellProductId: string
  cardToken?: string        // Pagar.me card token
  stripeCustomerId?: string // Stripe customer id para off-session
  stripePaymentMethodId?: string
}) {
  const { storeSlug } = getStoreContext(opts.event)

  const parentOrder = await (prisma as any).order.findUnique({
    where: { id: opts.parentOrderId },
    select: {
      id: true,
      customerId: true,
      storeSlug: true,
      currency: true,
      affiliateId: true,
    },
  })
  if (!parentOrder) throw new Error('Pedido pai não encontrado')

  const upsellProduct = await (prisma as any).produto.findUnique({
    where: { id: opts.upsellProductId },
    select: { id: true, nome: true, preco: true },
  })
  if (!upsellProduct) throw new Error('Produto de upsell não encontrado')

  const customer = await (prisma as any).customer.findUnique({
    where: { id: parentOrder.customerId },
    select: { id: true, email: true, nome: true, cpf: true },
  })
  if (!customer) throw new Error('Cliente não encontrado')

  const order = await (prisma as any).order.create({
    data: {
      status: 'PENDING',
      storeSlug: storeSlug || parentOrder.storeSlug,
      customerId: parentOrder.customerId,
      produtoId: opts.upsellProductId,
      subtotalAmount: upsellProduct.preco,
      totalAmount: upsellProduct.preco,
      currency: parentOrder.currency || 'BRL',
      affiliateId: parentOrder.affiliateId ?? null,
      parentOrderId: opts.parentOrderId,
    },
    select: { id: true },
  })

  // ── Cobrança via Pagar.me card token ─────────────────────────────────────
  if (opts.cardToken) {
    const pgCustomer: PagarmeCustomer = {
      name: customer.nome || customer.email,
      email: customer.email,
      document: (customer.cpf || '00000000000').replace(/\D/g, ''),
    }

    const result = await createPagarmeUpsell({
      orderId: order.id,
      amountBrl: upsellProduct.preco,
      customer: pgCustomer,
      cardToken: opts.cardToken,
    })

    await (prisma as any).order.update({
      where: { id: order.id },
      data: {
        pagarmeChargeId: result.charge_id,
        ...(result.status === 'paid' ? { status: 'PAID', pagoEm: new Date() } : {}),
      },
      select: { id: true },
    })

    if (result.status === 'paid') {
      await ensureMarketplaceCommissionForOrder(order.id)
      await fulfillPaidOrder(order.id)
    }

    return { orderId: order.id, gateway: 'pagarme', status: result.status }
  }

  // ── Cobrança via Stripe off-session ───────────────────────────────────────
  if (opts.stripeCustomerId && opts.stripePaymentMethodId) {
    const stripe = getStripe()
    const currency = (parentOrder.currency || 'usd').toLowerCase()
    const amount = Math.round(upsellProduct.preco * 100)

    const pi = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: opts.stripeCustomerId,
      payment_method: opts.stripePaymentMethodId,
      off_session: true,
      confirm: true,
      metadata: { orderId: order.id, upsell: 'true' },
    })

    await (prisma as any).order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: pi.id,
        ...(pi.status === 'succeeded' ? { status: 'PAID', pagoEm: new Date() } : {}),
      },
      select: { id: true },
    })

    if (pi.status === 'succeeded') {
      await ensureMarketplaceCommissionForOrder(order.id)
      await fulfillPaidOrder(order.id)
    }

    return { orderId: order.id, gateway: 'stripe', status: pi.status }
  }

  throw new Error('cardToken ou stripeCustomerId+stripePaymentMethodId obrigatórios')
}
