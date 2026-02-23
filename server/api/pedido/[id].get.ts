import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { getStoreContext, whereForStore } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  const ctx = getStoreContext()
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
      produto: {
        select: {
          id: true,
          nome: true,
          preco: true
        }
      }
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
      currency: order.currency,
      total: order.totalAmount ?? order.produto.preco,
      items: [
        {
          item_id: order.produto.id,
          item_name: order.produto.nome,
          price: order.produto.preco,
          quantity: 1
        }
      ]
    }
  }
})
