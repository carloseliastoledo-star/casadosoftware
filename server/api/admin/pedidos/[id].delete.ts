import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext, whereForStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const ctx = getStoreContext(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  }

  const order = await prisma.order.findFirst({
    where: whereForStore({ id }, ctx) as any,
    select: { id: true, status: true, storeSlug: true, licencas: { select: { id: true } } }
  })

  if (!order) {
    return { ok: true, deleted: 0 }
  }

  if (order.status === 'PAID') {
    throw createError({ statusCode: 400, statusMessage: 'Não é possível apagar pedido PAID' })
  }

  if (order.licencas.length > 0) {
    throw createError({ statusCode: 400, statusMessage: 'Não é possível apagar pedido com licença vinculada' })
  }

  await prisma.order.delete({ where: { id } })

  return { ok: true, deleted: 1 }
})
