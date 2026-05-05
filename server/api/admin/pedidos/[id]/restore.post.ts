import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '../../../../db/prisma'
import { requireAdminSession } from '../../../../utils/adminSession'
import { getStoreContext, whereForStore } from '../../../../utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const ctx = getStoreContext(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  }

  const order = await (prisma as any).order.findFirst({
    where: whereForStore({ id, deletedAt: { not: null } }, ctx) as any,
    select: { id: true }
  })

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Pedido excluído não encontrado' })
  }

  await (prisma as any).order.update({
    where: { id },
    data: { deletedAt: null }
  })

  return { ok: true }
})
