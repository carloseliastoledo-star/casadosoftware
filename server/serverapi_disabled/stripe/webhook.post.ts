import { defineEventHandler, readRawBody, getHeader, createError } from 'h3'
import Stripe from 'stripe'
import prisma from '../../db/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export default defineEventHandler(async (event) => {
  const sig = getHeader(event, 'stripe-signature')

  if (!sig) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing Stripe signature',
    })
  }

  const rawBody = await readRawBody(event)

  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing raw body',
    })
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('❌ Stripe signature verification failed:', err)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Stripe signature',
    })
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session

        const orderId = session.metadata?.orderId

        if (!orderId) {
          console.warn('⚠️ Webhook sem orderId no metadata')
          break
        }

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            stripeSessionId: session.id,
          },
        })

        console.log('✅ Pedido pago confirmado:', orderId)
        break
      }

      default:
        console.log(`ℹ️ Evento Stripe ignorado: ${stripeEvent.type}`)
    }

    return { received: true }
  } catch (err) {
    console.error('❌ Erro ao processar webhook Stripe:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook processing failed',
    })
  }
})
