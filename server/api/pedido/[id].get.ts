import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { getStoreContext, whereForStore } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  const ctx = getStoreContext(event)
  const id = String(getRouterParam(event, 'id') || '').trim()

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  }

  const order = await prisma.order.findFirst({
    where: whereForStore({ id }, ctx) as any,
    select: {
      id: true,
      status: true,
      currency: true,
      totalAmount: true,
      mercadoPagoPaymentId: true,
      stripePaymentIntentId: true,
      produto: {
        select: {
          id: true,
          nome: true,
          preco: true,
          produtoCategorias: {
            select: { categoria: { select: { nome: true } } },
            take: 1
          }
        }
      }
    }
  })

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  }

  const gateway = order.stripePaymentIntentId ? 'stripe' : 'mercado_pago'
  const currency = String(order.currency || (gateway === 'stripe' ? 'USD' : 'BRL')).toUpperCase()
  const categoryName = (order.produto as any).produtoCategorias?.[0]?.categoria?.nome || 'Software'

  return {
    ok: true,
    order: {
      id: order.id,
      status: order.status,
      currency,
      gateway,
      total: order.totalAmount ?? order.produto.preco,
      items: [
        {
          item_id: order.produto.id,
          item_name: order.produto.nome,
          price: order.produto.preco,
          quantity: 1,
          item_category: categoryName
        }
      ]
    }
  }
})
