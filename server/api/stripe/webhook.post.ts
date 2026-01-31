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
