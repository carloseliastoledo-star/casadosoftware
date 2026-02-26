import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import Stripe from 'stripe'
import prisma from '#root/server/db/prisma'
import { getStoreContext } from '#root/server/utils/store'

function round2(n: number) {
  return Math.round(n * 100) / 100
}

function formatStripeLikeError(err: any) {
  const name = String(err?.name || '').trim()
  const type = String(err?.type || '').trim()
  const code = String(err?.code || '').trim()
  const message = String(err?.message || '').trim()
  const statusCode = err?.statusCode
  const rawMessage = String(err?.raw?.message || '').trim()
  const param = String(err?.param || err?.raw?.param || '').trim()

  const parts: string[] = []
  if (name) parts.push(`name=${name}`)
  if (type) parts.push(`type=${type}`)
  if (code) parts.push(`code=${code}`)
  if (typeof statusCode === 'number') parts.push(`http=${statusCode}`)
  if (param) parts.push(`param=${param}`)

  const detail = rawMessage || message
  return {
    detail,
    meta: parts.length ? ` (${parts.join(' ')})` : ''
  }
}

export default defineEventHandler(async (event) => {
  const country = String(getCookie(event, 'ld_country') || '').trim().toUpperCase()
  if (country === 'BR' || !country) {
    throw createError({ statusCode: 403, statusMessage: 'Stripe disponível apenas para pagamentos fora do Brasil' })
  }

  const { storeSlug } = getStoreContext(event)
  if (!storeSlug) {
    throw createError({ statusCode: 500, statusMessage: 'STORE_SLUG não configurado' })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw createError({ statusCode: 500, statusMessage: 'STRIPE_SECRET_KEY não configurado' })
  }

  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    throw createError({ statusCode: 500, statusMessage: 'STRIPE_PUBLISHABLE_KEY não configurado' })
  }

  const body = await readBody(event)

  const produtoId = String(body?.produtoId || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const nome = body?.nome ? String(body.nome).trim() : undefined
  const whatsapp = body?.whatsapp ? String(body.whatsapp).trim() : undefined
  const currencyRequested = String(body?.currency || '').trim().toLowerCase()
  const countryCode = body?.countryCode ? String(body.countryCode).trim().toUpperCase() : null

  if (!produtoId) {
    throw createError({ statusCode: 400, statusMessage: 'produtoId obrigatório' })
  }

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Email inválido' })
  }

  if (currencyRequested !== 'usd' && currencyRequested !== 'eur') {
    throw createError({ statusCode: 400, statusMessage: 'currency inválida (usd|eur)' })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

  try {
    const result = await (prisma as any).$transaction(async (tx: any) => {
      const anyTx: any = tx as any

      const customer = await tx.customer.upsert({
        where: { email_storeSlug: { email, storeSlug } },
        create: {
          email,
          storeSlug,
          nome: nome || null,
          whatsapp: whatsapp || null
        },
        update: {
          nome: nome || undefined,
          whatsapp: whatsapp || undefined
        }
      })

      const produto = await anyTx.produto.findUnique({
        where: { id: produtoId },
        select: {
          id: true,
          nome: true,
          preco: true,
          precosLoja: {
            where: { storeSlug: storeSlug || undefined },
            select: { preco: true }
          },
          precosMoeda: {
            where: { storeSlug: storeSlug || undefined },
            select: { currency: true, amount: true }
          }
        }
      })

      if (!produto) {
        throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })
      }

      const byCurrency = new Map(
        ((produto as any).precosMoeda || [])
          .map((x: any) => ({
            currency: String(x.currency || '').trim().toLowerCase(),
            amount: Number(x.amount)
          }))
          .filter((x: any) => x.currency)
          .map((x: any) => [x.currency, x])
      )

      const requestedRow = byCurrency.get(currencyRequested)
      const usdRow = byCurrency.get('usd')

      let currencyEffective: 'usd' | 'eur' = currencyRequested as any
      let amountEffective = requestedRow ? Number(requestedRow.amount) : NaN

      if (!Number.isFinite(amountEffective) || amountEffective <= 0) {
        currencyEffective = 'usd'
        amountEffective = usdRow ? Number(usdRow.amount) : NaN
      }

      if (!Number.isFinite(amountEffective) || amountEffective <= 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Preço internacional não configurado (cadastre USD/EUR no produto)'
        })
      }

      const subtotalAmount = round2(amountEffective)
      const totalAmount = subtotalAmount

      const order = await tx.order.create({
        data: {
          status: 'PENDING',
          storeSlug,
          currency: currencyEffective,
          countryCode,
          produtoId: produto.id,
          customerId: customer.id,
          subtotalAmount,
          totalAmount
        },
        select: { id: true }
      })

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: currencyEffective,
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: order.id,
          storeSlug,
          produtoId: produto.id,
          countryCode: countryCode || ''
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
        currency: currencyEffective,
        amount: totalAmount
      }
    })

    if (!result.clientSecret) {
      throw createError({ statusCode: 502, statusMessage: 'Falha ao criar PaymentIntent' })
    }

    return {
      ok: true,
      orderId: result.orderId,
      clientSecret: result.clientSecret,
      currency: result.currency,
      amount: result.amount,
      publishableKey: String(process.env.STRIPE_PUBLISHABLE_KEY || '')
    }
  } catch (err: any) {
    console.error('[stripe][payment-intent] failed', {
      message: err?.message,
      name: err?.name,
      type: err?.type,
      code: err?.code,
      statusCode: err?.statusCode,
      rawMessage: err?.raw?.message,
      storeSlug,
      produtoId,
      currencyRequested,
      countryCode
    })

    if (err?.statusCode && err?.statusMessage) {
      throw err
    }

    const formatted = formatStripeLikeError(err)
    throw createError({
      statusCode: 500,
      statusMessage: formatted.detail ? `Stripe error: ${formatted.detail}${formatted.meta}` : 'Stripe error'
    })
  }
})
