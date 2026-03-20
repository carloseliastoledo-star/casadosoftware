/**
 * Payment Router — BR → Pagar.me (com fallback Stripe), INT → Stripe (com fallback Pagar.me)
 */
import Stripe from 'stripe'
import { createPagarmePix, createPagarmeCard } from './pagarme'
import type { PagarmeCustomer, PagarmeSplitRule } from './pagarme'

export type PaymentMethod = 'pix' | 'credit_card' | 'stripe_card'

export interface RouterInput {
  orderId: string
  amountBrl: number
  amountUsd?: number
  currency?: string
  country: string
  method: PaymentMethod
  product: string
  customer: {
    name: string
    email: string
    document?: string
  }
  card?: {
    number: string
    holder_name: string
    exp_month: number
    exp_year: number
    cvv: string
    token?: string
  }
  installments?: number
  affiliateRecipientId?: string
  affiliatePercentage?: number
}

export type RouterResult =
  | { gateway: 'pagarme'; method: 'pix'; chargeId: string; qrCode: string; qrCodeUrl: string; expiresAt: string }
  | { gateway: 'pagarme'; method: 'credit_card'; chargeId: string; status: string }
  | { gateway: 'stripe'; method: 'stripe_card'; clientSecret: string; publishableKey: string; currency: string; amount: number }

function buildPagarmeCustomer(c: RouterInput['customer']): PagarmeCustomer {
  return {
    name: c.name,
    email: c.email,
    document: (c.document || '00000000000').replace(/\D/g, ''),
    document_type: 'CPF',
    type: 'individual',
  }
}

function buildSplitRules(affiliateRecipientId?: string, affiliatePercentage?: number): PagarmeSplitRule[] | undefined {
  if (!affiliateRecipientId || !affiliatePercentage) return undefined
  return [
    {
      recipient_id: affiliateRecipientId,
      percentage: affiliatePercentage,
      liable: false,
      charge_processing_fee: false,
    },
  ]
}

function getStripe() {
  const key = String(process.env.STRIPE_SECRET_KEY || '').trim()
  if (!key) throw new Error('STRIPE_SECRET_KEY não configurado')
  return new Stripe(key, { apiVersion: '2025-12-15.clover' as any })
}

async function routeStripeCard(input: RouterInput): Promise<RouterResult> {
  const stripe = getStripe()
  const currency = (input.currency || 'usd').toLowerCase()
  const amount = Math.round((input.amountUsd ?? input.amountBrl) * 100)

  const pi = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      orderId: input.orderId,
      country: input.country,
    },
    ...(input.affiliateRecipientId
      ? {
          transfer_data: { destination: input.affiliateRecipientId },
          application_fee_amount: Math.round(amount * ((input.affiliatePercentage ?? 0) / 100)),
        }
      : {}),
  })

  return {
    gateway: 'stripe',
    method: 'stripe_card',
    clientSecret: pi.client_secret!,
    publishableKey: String(process.env.STRIPE_PUBLISHABLE_KEY || ''),
    currency,
    amount: (input.amountUsd ?? input.amountBrl),
  }
}

export async function routePayment(input: RouterInput): Promise<RouterResult> {
  const isBR = input.country === 'BR'
  const split = buildSplitRules(input.affiliateRecipientId, input.affiliatePercentage)

  if (input.method === 'pix') {
    try {
      const res = await createPagarmePix({
        orderId: input.orderId,
        amountBrl: input.amountBrl,
        customer: buildPagarmeCustomer(input.customer),
        split,
      })
      return { gateway: 'pagarme', method: 'pix', chargeId: res.charge_id, qrCode: res.qr_code, qrCodeUrl: res.qr_code_url, expiresAt: res.expires_at }
    } catch (err) {
      console.error('[paymentRouter] pix via pagarme falhou, sem fallback para PIX:', err)
      throw err
    }
  }

  if (input.method === 'credit_card' && isBR) {
    if (!input.card) throw new Error('Dados do cartão obrigatórios')
    try {
      const res = await createPagarmeCard({
        orderId: input.orderId,
        amountBrl: input.amountBrl,
        installments: input.installments ?? 1,
        customer: buildPagarmeCustomer(input.customer),
        card: input.card,
        split,
      })
      return { gateway: 'pagarme', method: 'credit_card', chargeId: res.charge_id, status: res.status }
    } catch (err) {
      // fallback automático para Stripe
      console.warn('[paymentRouter] cartão BR via pagarme falhou, tentando Stripe:', err)
      return await routeStripeCard(input)
    }
  }

  // Internacional ou método stripe_card
  try {
    return await routeStripeCard(input)
  } catch (err) {
    // fallback Pagar.me cartão
    if (input.card) {
      console.warn('[paymentRouter] Stripe falhou, tentando Pagar.me como fallback:', err)
      const res = await createPagarmeCard({
        orderId: input.orderId,
        amountBrl: input.amountBrl,
        installments: 1,
        customer: buildPagarmeCustomer(input.customer),
        card: input.card,
        split,
      })
      return { gateway: 'pagarme', method: 'credit_card', chargeId: res.charge_id, status: res.status }
    }
    throw err
  }
}
