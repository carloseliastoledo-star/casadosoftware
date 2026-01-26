import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { getMpPayment } from '#root/server/utils/mercadopago'
import { processMercadoPagoPayment } from '#root/server/utils/mercadopagoWebhook'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const orderId = String(query.orderId || '').trim()

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'orderId obrigatório' })
  }

  let order = await prisma.order.findUnique({
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

  const statusUpper = String(order.status || '').toUpperCase()
  const mpPaymentId = String(order.mercadoPagoPaymentId || '').trim()

  if (statusUpper !== 'PAID' && mpPaymentId) {
    try {
      const payment = getMpPayment()
      const mpPayment = await payment.get({ id: mpPaymentId })
      const mpStatus = String((mpPayment as any)?.status || '').toLowerCase()

      if (mpStatus === 'approved') {
        order = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            pagoEm: new Date(),
            mercadoPagoPaymentId: String((mpPayment as any)?.id || mpPaymentId)
          },
          select: {
            id: true,
            status: true,
            pagoEm: true,
            mercadoPagoPaymentId: true
          }
        })

        processMercadoPagoPayment(String((mpPayment as any)?.id || mpPaymentId)).catch((err) => {
          console.log('[order-status] processMercadoPagoPayment error', err)
        })
      }
    } catch {
      // se falhar (token/MP indisponível), apenas retorna o status atual do pedido
    }
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
