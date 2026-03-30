import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (_event) => {
  const secretKey = String(process.env.STRIPE_SECRET_KEY || '').trim()
  const publishableKey = String(process.env.STRIPE_PUBLISHABLE_KEY || '').trim()
  const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || '').trim()

  const envCheck = {
    STRIPE_SECRET_KEY: secretKey ? `set (${secretKey.substring(0, 7)}...)` : 'NOT SET',
    STRIPE_PUBLISHABLE_KEY: publishableKey ? `set (${publishableKey.substring(0, 7)}...)` : 'NOT SET',
    STRIPE_WEBHOOK_SECRET: webhookSecret ? `set (${webhookSecret.substring(0, 7)}...)` : 'NOT SET',
    isTestMode: secretKey.startsWith('sk_test_'),
  }

  if (!secretKey) {
    return { ok: false, envCheck, error: 'STRIPE_SECRET_KEY não configurado' }
  }

  try {
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' })

    const balance = await stripe.balance.retrieve()

    let productsWithIntlPricing: any[] = []
    try {
      const { default: prisma } = await import('#root/server/db/prisma')
      const rows = await (prisma as any).precoMoeda.findMany({
        where: { currency: { in: ['usd', 'eur', 'USD', 'EUR'] } },
        select: { produtoId: true, currency: true, amount: true, storeSlug: true },
        take: 10
      })
      productsWithIntlPricing = rows.map((r: any) => ({
        produtoId: r.produtoId,
        currency: r.currency,
        amount: Number(r.amount),
        storeSlug: r.storeSlug
      }))
    } catch (dbErr: any) {
      productsWithIntlPricing = [{ error: dbErr?.message || 'DB query failed' }]
    }

    return {
      ok: true,
      envCheck,
      stripeMode: balance.livemode ? 'live' : 'test',
      balanceCurrencies: balance.available.map(b => ({ currency: b.currency, amount: b.amount })),
      productsWithIntlPricing
    }
  } catch (err: any) {
    return {
      ok: false,
      envCheck,
      error: err?.message || 'Stripe connection failed',
      type: err?.type,
      code: err?.code
    }
  }
})
