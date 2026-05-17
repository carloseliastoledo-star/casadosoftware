/**
 * /api/intl/payment-intent
 * Endpoint dedicado para checkout internacional (Stripe-only, USD/EUR)
 * Não requer cookie ld_country - aceita qualquer país
 * Garante storeSlug='international' independente do ambiente
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { randomUUID } from 'node:crypto'
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
    // --- 1. Buscar produto (sem transaction) ---
    const produto = await prismaAny.produto.findUnique({
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

    // --- 2. Calcular preço ---
    const byCurrency = new Map<string, number>(
      (produto.ProdutoPrecoMoeda || [])
        .filter((x: any) => x.currency && Number.isFinite(Number(x.amount)) && Number(x.amount) > 0)
        .map((x: any) => [String(x.currency).trim().toLowerCase(), Number(x.amount)])
    )

    let totalAmount: number
    if (byCurrency.has(currencyRequested)) {
      totalAmount = round2(byCurrency.get(currencyRequested)!)
    } else {
      const lojaPreco = produto.ProdutoPrecoLoja?.[0]
      const basePreco = lojaPreco?.preco ? Number(lojaPreco.preco) : Number(produto.preco ?? 0)
      if (!Number.isFinite(basePreco) || basePreco <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'This product does not have a price configured. Please contact support.' })
      }
      totalAmount = round2(basePreco)
    }

    // --- 3. Upsert customer ---
    const customer = await prismaAny.customer.upsert({
      where: { email_storeSlug: { email, storeSlug } },
      create: { email, storeSlug, nome: nome || null },
      update: { nome: nome || undefined }
    })

    // --- 4. Reutilizar PaymentIntent existente (sem Stripe call dentro de tx) ---
    const reuseAfter = new Date(Date.now() - 60 * 60 * 1000)
    const existing = await prismaAny.order.findFirst({
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
          ok: true,
          orderId: existing.id,
          clientSecret: pi.client_secret,
          currency: currencyRequested,
          amount: Number(existing.totalAmount ?? 0),
          publishableKey: stripePublishableKey
        }
      }
    }

    // --- 5. Buscar affiliate ---
    let affiliateId: number | null = null
    if (String(process.env.AFFILIATE_ENABLED || '').trim().toLowerCase() === 'true' && affiliate) {
      const found = await prismaAny.affiliate.findUnique({
        where: { code: affiliate },
        select: { id: true }
      })
      affiliateId = found?.id ?? null
    }

    // --- 6. Criar order ---
    const orderId = randomUUID()
    await prismaAny.order.create({
      data: {
        id: orderId,
        status: 'PENDING',
        storeSlug,
        currency: currencyRequested,
        countryCode,
        produtoId: produto.id,
        customerId: customer.id,
        subtotalAmount: totalAmount,
        totalAmount,
        affiliateId: affiliateId ?? null
      }
    })

    // --- 7. Criar PaymentIntent no Stripe (fora de qualquer transaction) ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: currencyRequested,
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId,
        storeSlug,
        produtoId: produto.id,
        countryCode: countryCode || '',
        affiliate: affiliate || ''
      }
    })

    // --- 8. Salvar stripePaymentIntentId na order ---
    await prismaAny.order.update({
      where: { id: orderId },
      data: { stripePaymentIntentId: paymentIntent.id }
    })

    if (!paymentIntent.client_secret) {
      throw createError({ statusCode: 502, statusMessage: 'Failed to create PaymentIntent' })
    }

    return {
      ok: true,
      orderId,
      clientSecret: paymentIntent.client_secret,
      currency: currencyRequested,
      amount: totalAmount,
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
