import prisma from '../../db/prisma'

export default defineEventHandler(async (event) => {
  const orderId = getQuery(event)?.orderId as string
  
  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required'
    })
  }

  try {
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    })

    if (!order) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found'
      })
    }

    // Check if order already has an upsell
    if (order.parentOrderId) {
      return { hasUpsell: false }
    }

    // Check if there's already an upsell for this order
    const existingUpsell = await prisma.order.findFirst({
      where: {
        parentOrderId: orderId
      }
    })

    if (existingUpsell) {
      return { hasUpsell: false }
    }

    // TODO: Implement upsell product logic
    // For now, we'll return false - you can implement this later
    // based on your business rules for which products have upsells
    
    return { 
      hasUpsell: false,
      // cardToken: order.cardToken, // Uncomment when you have card tokens
      // stripeCustomerId: order.stripeCustomerId, // Uncomment when using Stripe
      // stripePaymentMethodId: order.stripePaymentMethodId // Uncomment when using Stripe
    }

  } catch (error: any) {
    console.error('Error checking upsell:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check upsell availability'
    })
  }
})
