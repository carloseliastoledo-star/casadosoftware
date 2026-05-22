/**
 * Payment Router — BR → Pagar.me / MercadoPago (com fallback Stripe), INT → Stripe
 */
import Stripe from 'stripe'
import { createPagarmePix, createPagarmeCard } from './pagarme'
import type { PagarmeCustomer, PagarmeSplitRule } from './pagarme'
import { createMercadoPagoPix, createMercadoPagoCard } from './mercadopago'

export type PaymentMethod = 'pix' | 'credit_card' | 'stripe_card'
export type GatewayName = 'mercadopago' | 'pagarme' | 'pagbank'

export interface RouterInput {
  orderId: string
  amountBrl: number
  amountUsd?: number
  currency?: string
  country: string
  method: PaymentMethod
  product: string
  pixGateway?: GatewayName
  cardGateway?: GatewayName
  customer: {
    name: string
    email: string
    document?: string
    phone?: string
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
  items?: Array<{ title: string; quantity: number; unit_price: number }>
}

export type RouterResult =
  | { gateway: 'pagarme';      method: 'pix';         chargeId: string;    qrCode: string; qrCodeUrl: string; expiresAt: string }
  | { gateway: 'mercadopago'; method: 'pix';         paymentId: string;   qrCode: string; qrCodeUrl: string; expiresAt: string }
  | { gateway: 'pagarme';      method: 'credit_card'; chargeId: string;    status: string }
  | { gateway: 'mercadopago'; method: 'credit_card'; paymentId: string;   status: string }
  | { gateway: 'stripe';       method: 'stripe_card'; clientSecret: string; publishableKey: string; currency: string; amount: number }

function parsePhone(raw?: string): PagarmeCustomer['phones'] | undefined {
  if (!raw) return undefined
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 10) return undefined
  const area   = digits.slice(0, 2)
  const number = digits.slice(2)
  return { mobile_phone: { country_code: '55', area_code: area, number } }
}

function buildPagarmeCustomer(c: RouterInput['customer']): PagarmeCustomer {
  return {
    name: c.name,
    email: c.email,
    document: (c.document || '00000000000').replace(/\D/g, ''),
    document_type: 'CPF',
    type: 'individual',
    phones: parsePhone(c.phone),
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
  
  // Para Stripe, sempre usar amountUsd se disponível, caso contrário não processar
  const amount = input.amountUsd ? Math.round(input.amountUsd * 100) : Math.round(input.amountBrl * 100)

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
    amount: input.amountUsd ?? input.amountBrl,
  }
}

export async function routePayment(input: RouterInput): Promise<RouterResult> {
  const isBR = input.country === 'BR'
  const split = buildSplitRules(input.affiliateRecipientId, input.affiliatePercentage)
  const pixGw  = input.pixGateway  || 'mercadopago'
  const cardGw = input.cardGateway || 'mercadopago'

  if (input.method === 'pix') {
    console.log('[paymentRouter] PIX payment - pixGateway:', pixGw, 'amountBrl:', input.amountBrl)
    // ── MercadoPago PIX (único gateway configurado) ──────────────────────────────
    try {
      console.log('[paymentRouter] Trying MercadoPago PIX')
      const res = await createMercadoPagoPix({
        orderId: input.orderId,
        amountBrl: input.amountBrl,
        description: input.product,
        customer: {
          name: input.customer.name,
          email: input.customer.email,
          document: input.customer.document || '00000000000',
        },
        items: input.items
      })
      console.log('[paymentRouter] MercadoPago PIX success:', { paymentId: res.payment_id })
      const qrCodeUrl = res.qr_code_base64
        ? `data:image/png;base64,${res.qr_code_base64}`
        : ''
      return { gateway: 'mercadopago', method: 'pix', paymentId: res.payment_id, qrCode: res.qr_code, qrCodeUrl, expiresAt: res.expires_at }
    } catch (err) {
      console.error('[paymentRouter] MercadoPago PIX failed:', err)
      throw err
    }
  }

  if (input.method === 'credit_card' && isBR) {
    if (!input.card) throw new Error('Dados do cartão obrigatórios')
    // ── MercadoPago card (requer token do SDK frontend) ──────────────────────
    if (cardGw === 'mercadopago') {
      if (!input.card?.token) throw new Error('Token do Mercado Pago obrigatório')
      try {
        const res = await createMercadoPagoCard({
          orderId: input.orderId,
          amountBrl: input.amountBrl,
          installments: input.installments ?? 1,
          customer: { name: input.customer.name, email: input.customer.email, document: input.customer.document || '' },
          token: input.card.token,
          items: input.items
        })
        return { gateway: 'mercadopago', method: 'credit_card', paymentId: res.payment_id, status: res.status }
      } catch (err) {
        console.error('[paymentRouter] cartão MercadoPago falhou:', err)
        throw err
      }
    }
    // ── Pagar.me card (se configurado) ──────────────────────────────────
    if (cardGw === 'pagarme') {
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
        console.error('[paymentRouter] cartão Pagar.me falhou:', err)
        throw err
      }
    }
    // ── PagBank card (se configurado) ──────────────────────────────────
    if (cardGw === 'pagbank') {
      throw new Error('PagBank ainda não implementado para cartão')
    }

    throw new Error(`Gateway de cartão '${cardGw}' não suportado`)
  }

  // Internacional ou método stripe_card
  if (!isBR || input.method === 'stripe_card') {
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

  throw new Error('Método de pagamento não suportado para este país')
}
