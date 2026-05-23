import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { requireAdminSession } from '#root/server/utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do pedido obrigatório' })

  const order = await (prisma as any).order.findUnique({
    where: { id },
    select: {
      id: true,
      numero: true,
      status: true,
      totalAmount: true,
      mercadoPagoPaymentId: true,
      pagarmeChargeId: true,
      stripePaymentIntentId: true,
      mercadoPagoPaymentTypeId: true,
      mercadoPagoPaymentMethodId: true,
      criadoEm: true,
      pagoEm: true,
      Customer: {
        select: {
          email: true,
          nome: true,
          whatsapp: true,
          cpf: true
        }
      },
      Produto: {
        select: {
          nome: true,
          slug: true
        }
      }
    }
  })

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })

  let paymentMethod = 'Não identificado'
  let paymentDetails: any = {}

  if (order.mercadoPagoPaymentId) {
    paymentMethod = 'Mercado Pago'
    paymentDetails = {
      paymentId: order.mercadoPagoPaymentId,
      paymentTypeId: order.mercadoPagoPaymentTypeId,
      paymentMethodId: order.mercadoPagoPaymentMethodId
    }
  } else if (order.pagarmeChargeId) {
    paymentMethod = 'Pagar.me'
    paymentDetails = {
      chargeId: order.pagarmeChargeId
    }
  } else if (order.stripePaymentIntentId) {
    paymentMethod = 'Stripe'
    paymentDetails = {
      paymentIntentId: order.stripePaymentIntentId
    }
  }

  return {
    ok: true,
    order,
    paymentMethod,
    paymentDetails
  }
})
