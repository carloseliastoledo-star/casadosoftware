import { defineEventHandler, getRouterParam, createError, getHeader } from 'h3'
import prisma from '../../../../db/prisma'
import { requireAdminSession, getAdminSession } from '../../../../utils/adminSession'
import { getStoreContext, whereForStore } from '../../../../utils/store'
import { createAuditLog } from '../../../../utils/auditLog'

export default defineEventHandler(async (event) => {
  const session = getAdminSession(event)
  requireAdminSession(event)

  const ctx = getStoreContext(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  }

  const order = await (prisma as any).order.findFirst({
    where: whereForStore({ id, deletedAt: { not: null } }, ctx) as any,
    select: { id: true, numero: true, status: true }
  })

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Pedido excluído não encontrado' })
  }

  await (prisma as any).order.update({
    where: { id },
    data: { deletedAt: null }
  })

  // Gravar AuditLog
  if (session?.id) {
    const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    await createAuditLog({
      action: 'ORDER_RESTORE',
      entity: 'Order',
      entityId: id,
      adminId: session.id,
      adminEmail: session.email || 'unknown',
      details: JSON.stringify({
        orderNumero: order.numero,
        orderStatus: order.status
      }),
      ip,
      userAgent,
      storeSlug: ctx?.storeSlug
    })
  }

  return { ok: true }
})
