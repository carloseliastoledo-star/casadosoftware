/**
 * /api/intl/payment-intent
 * Endpoint dedicado para checkout internacional (Stripe-only, USD/EUR)
 * Não requer cookie ld_country - aceita qualquer país
 * Garante storeSlug='international' independente do ambiente
 */
import { defineEventHandler, readBody, createError } from 'h3'
import Stripe from 'stripe'
import prisma from '#root/server/db/prisma'
import { getStoreContext } from '#root/server/utils/store'

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export default defineEventHandler(async (event) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw createError({ statusCode: 500, statusMessage: 'STRIPE_SECRET_KEY not configured' })
  }

  const stripePublishableKey = process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || ''
  if (!stripePublishableKey) {
    throw createError({ statusCode: 500, statusMessage: 'STRIPE_PUBLISHABLE_KEY not configured' })
  }

  const { storeSlug: detectedSlug } = getStoreContext(event)
  const storeSlug = detectedSlug || 'international'

  const body = await readBody(event)

  const produtoId = String(body?.produtoId || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const nome = body?.nome ? String(body.nome).trim() : undefined
  const currencyRequested = String(body?.currency || 'usd').trim().toLowerCase() as 'usd' | 'eur'
  const countryCode = body?.countryCode ? String(body.countryCode).trim().toUpperCase() : null
  const affiliate = String(body?.affiliate || '').trim()

  if (!produtoId) {
    throw createError({ statusCode: 400, statusMessage: 'produtoId is required' })
  }

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' })
  }

  if (currencyRequested !== 'usd' && currencyRequested !== 'eur') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid currency. Use usd or eur.' })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2026-02-25.clover' })
  const prismaAny = prisma as any

  try {
    const result = await prismaAny.$transaction(async (tx: any) => {
      const customer = await tx.customer.upsert({
        where: { email_storeSlug: { email, storeSlug } },
        create: { email, storeSlug, nome: nome || null },
        update: { nome: nome || undefined }
      })

      const produto = await tx.produto.findUnique({
        where: { id: produtoId },
        select: {
          id: true,
          nome: true,
          ativo: true,
          preco: true,
          precoAntigo: true,
          ProdutoPrecoMoeda: {
            where: { storeSlug },
            select: { currency: true, amount: true }
          },
          ProdutoPrecoLoja: {
            where: { storeSlug },
            select: { preco: true },
            take: 1
          }
        }
      })

      if (!produto || !produto.ativo) {
        throw createError({ statusCode: 404, statusMessage: 'Product not found' })
      }

      // Prioridade: ProdutoPrecoMoeda > ProdutoPrecoLoja > produto.preco (fallback)
      const byCurrency = new Map<string, number>(
        ((produto as any).ProdutoPrecoMoeda || [])
          .filter((x: any) => x.currency && Number.isFinite(Number(x.amount)) && Number(x.amount) > 0)
          .map((x: any) => [String(x.currency).trim().toLowerCase(), Number(x.amount)])
      )

      let totalAmount: number
      if (byCurrency.has(currencyRequested)) {
        totalAmount = round2(byCurrency.get(currencyRequested)!)
      } else {
        // Fallback: usar preco base do produto (mesmo sem ProdutoPrecoMoeda)
        const lojaPreco = (produto as any).ProdutoPrecoLoja?.[0]
        const basePreco = lojaPreco?.preco ? Number(lojaPreco.preco) : Number((produto as any).preco ?? 0)
        if (!Number.isFinite(basePreco) || basePreco <= 0) {
          throw createError({
            statusCode: 400,
            statusMessage: `This product does not have a price configured. Please contact support.`
          })
        }
        totalAmount = round2(basePreco)
      }

      const reuseAfter = new Date(Date.now() - 60 * 60 * 1000)
      const existing = await tx.order.findFirst({
        where: {
          status: 'PENDING',
          storeSlug,
          customerId: customer.id,
          produtoId: produto.id,
          currency: currencyRequested,
          stripePaymentIntentId: { not: null },
          criadoEm: { gte: reuseAfter }
        },
        orderBy: { criadoEm: 'desc' },
        select: { id: true, stripePaymentIntentId: true, totalAmount: true }
      })

      if (existing?.stripePaymentIntentId) {
        const pi = await stripe.paymentIntents.retrieve(String(existing.stripePaymentIntentId))
        if (pi?.client_secret) {
          return {
            orderId: existing.id,
            clientSecret: pi.client_secret,
            currency: currencyRequested,
            amount: Number(existing.totalAmount ?? 0)
          }
        }
      }

      let affiliateId: number | null = null
      if (String(process.env.AFFILIATE_ENABLED || '').trim().toLowerCase() === 'true' && affiliate) {
        const found = await tx.affiliate.findUnique({
          where: { code: affiliate },
          select: { id: true }
        })
        affiliateId = found?.id ?? null
      }

      const order = await tx.order.create({
        data: {
          status: 'PENDING',
          storeSlug,
          currency: currencyRequested,
          countryCode,
          produtoId: produto.id,
          customerId: customer.id,
          subtotalAmount: totalAmount,
          totalAmount,
          affiliateId: affiliateId ?? null
        },
        select: { id: true }
      })

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: currencyRequested,
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: order.id,
          storeSlug,
          produtoId: produto.id,
          countryCode: countryCode || '',
          affiliate: affiliate || ''
        }
      })

      await tx.order.update({
        where: { id: order.id },
        data: { stripePaymentIntentId: paymentIntent.id },
        select: { id: true }
      })

      return {
        orderId: order.id,
        clientSecret: paymentIntent.client_secret,
        currency: currencyRequested,
        amount: totalAmount
      }
    })

    if (!result.clientSecret) {
      throw createError({ statusCode: 502, statusMessage: 'Failed to create PaymentIntent' })
    }

    return {
      ok: true,
      orderId: result.orderId,
      clientSecret: result.clientSecret,
      currency: result.currency,
      amount: result.amount,
      publishableKey: stripePublishableKey
    }
  } catch (err: any) {
    console.error('[intl][payment-intent] failed', {
      message: err?.message,
      storeSlug,
      produtoId,
      currencyRequested
    })

    if (err?.statusCode && err?.statusMessage) throw err

    throw createError({
      statusCode: 500,
      statusMessage: err?.raw?.message || err?.message || 'Payment error. Please try again.'
    })
  }
})
