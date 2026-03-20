import Stripe from 'stripe'
import { getProductBySlug } from '~/data/catalog'
import { createError, defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ slug?: string }>(event)

  const slug = String(body?.slug || '').trim()
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing product slug' })
  }

  const product = getProductBySlug(slug)
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || String(config.stripeSecretKey || '')
  if (!secretKey) {
    throw createError({ statusCode: 500, statusMessage: 'Stripe secret key is not configured' })
  }

  const successUrl = process.env.STRIPE_SUCCESS_URL || String((config.public as any)?.stripeSuccessUrl || '')
  const cancelUrl = process.env.STRIPE_CANCEL_URL || String((config.public as any)?.stripeCancelUrl || '')

  if (!successUrl || !cancelUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe success/cancel URLs are not configured'
    })
  }

  const stripe = new Stripe(secretKey)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: product.priceUsdCents,
          product_data: {
            name: product.title,
            description: product.shortDescription
          }
        }
      }
    ],
    metadata: {
      productSlug: product.slug,
      categorySlug: product.categorySlug
    }
  })

  return { url: session.url }
})
