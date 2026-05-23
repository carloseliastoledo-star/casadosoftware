import { defineEventHandler, readBody, createError, getHeader } from 'h3'
import prisma from '../../db/prisma'
import { requireAdminSession, getAdminSession } from '../../utils/adminSession'
import { createAuditLog } from '../../utils/auditLog'

export default defineEventHandler(async (event) => {
  const session = getAdminSession(event)
  await requireAdminSession(event)

  const body = await readBody(event)
  const { statusFilter, hoursAgo } = body || {}

  const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
  const userAgent = getHeader(event, 'user-agent') || 'unknown'

  console.log('[bulk-restore-orders] Starting bulk restore', {
    adminEmail: session?.email,
    adminId: session?.id,
    statusFilter,
    hoursAgo
  })

  // Buscar pedidos excluídos
  const where: any = { deletedAt: { not: null } }

  if (statusFilter) {
    where.status = statusFilter
  }

  if (hoursAgo) {
    const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
    where.deletedAt = { gte: cutoff }
  }

  const deletedOrders = await (prisma as any).order.findMany({
    where,
    select: { id: true, numero: true, status: true, deletedAt: true, storeSlug: true },
    orderBy: { deletedAt: 'desc' },
    take: 500
  })

  console.log('[bulk-restore-orders] Found deleted orders:', deletedOrders.length)

  if (deletedOrders.length === 0) {
    return { ok: true, restored: 0, message: 'Nenhum pedido excluído encontrado' }
  }

  // Restaurar pedidos
  const result = await (prisma as any).order.updateMany({
    where: {
      id: { in: deletedOrders.map((o: any) => o.id) }
    },
    data: { deletedAt: null }
  })

  const restored = Number(result.count)

  console.log('[bulk-restore-orders] Restored orders:', restored)

  // Gravar AuditLog
  if (restored > 0 && session?.id) {
    await createAuditLog({
      action: 'ORDER_BULK_RESTORE',
      entity: 'Order',
      entityId: deletedOrders.map((o: any) => o.id).join(','),
      adminId: session.id,
      adminEmail: session.email || 'unknown',
      details: JSON.stringify({
        restoredCount: restored,
        orderNumbers: deletedOrders.map((o: any) => o.numero),
        orderIds: deletedOrders.map((o: any) => o.id),
        statuses: deletedOrders.map((o: any) => o.status)
      }),
      ip,
      userAgent,
      storeSlug: deletedOrders[0]?.storeSlug
    })
  }

  return {
    ok: true,
    restored,
    orders: deletedOrders.map((o: any) => ({
      id: o.id,
      numero: o.numero,
      status: o.status,
      deletedAt: o.deletedAt
    }))
  }
})
