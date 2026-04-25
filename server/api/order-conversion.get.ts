import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { getStoreContext, whereForStore } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  const ctx = getStoreContext(event)
  const query = getQuery(event)
  const orderId = String(query.orderId || '').trim()

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'orderId obrigatório' })
  }

  const order = await prisma.order.findFirst({
    where: whereForStore({ id: orderId }, ctx) as any,
    select: {
      id: true,
      produto: {
        select: {
          googleAdsConversionLabel: true,
          googleAdsConversionValue: true,
          googleAdsConversionCurrency: true
        }
      }
    }
  })

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  }

  return {
    ok: true,
    conversion: {
      label: order.produto.googleAdsConversionLabel || null,
      value: order.produto.googleAdsConversionValue,
      currency: order.produto.googleAdsConversionCurrency || null,
      transactionId: order.id
    }
  }
})
