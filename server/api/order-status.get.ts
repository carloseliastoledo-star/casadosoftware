import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '#root/server/db/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const orderId = String(query.orderId || '').trim()

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'orderId obrigatório' })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      pagoEm: true,
      mercadoPagoPaymentId: true
    }
  })

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  }

  return {
    ok: true,
    order: {
      id: order.id,
      status: order.status,
      pagoEm: order.pagoEm,
      mercadoPagoPaymentId: order.mercadoPagoPaymentId
    }
  }
})
