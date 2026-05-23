import { defineEventHandler, readBody, getHeader } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession, getAdminSession } from '../../../utils/adminSession'
import { getStoreContext, whereForStore } from '../../../utils/store'
import { createAuditLog } from '../../../utils/auditLog'

export default defineEventHandler(async (event) => {
  const session = getAdminSession(event)
  requireAdminSession(event)

  const ctx = getStoreContext(event)

  const body = await readBody(event)

  const idsRaw = Array.isArray(body?.ids) ? body.ids : []
  const ids = idsRaw.map((x: any) => String(x || '').trim()).filter(Boolean)

  const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
  const userAgent = getHeader(event, 'user-agent') || 'unknown'

  console.log('[bulk-delete] Starting bulk delete', {
    adminEmail: session?.email,
    adminId: session?.id,
    ip,
    userAgent,
    idsCount: ids.length,
    ids: ids.slice(0, 10),
    storeSlug: ctx?.storeSlug
  })

  if (!ids.length) {
    return { ok: true, deleted: 0, skipped: 0 }
  }

  const orders = await (prisma as any).order.findMany({
    where: whereForStore({ id: { in: ids }, deletedAt: null }, ctx) as any,
    select: { id: true, numero: true, status: true, totalAmount: true, criadoEm: true }
  })

  console.log('[bulk-delete] Found orders to delete', {
    count: orders.length,
    orders: orders.map(o => ({ id: o.id, numero: o.numero, status: o.status, totalAmount: o.totalAmount, criadoEm: o.criadoEm }))
  })

  const deletableIds = orders.map((o: any) => o.id)

  if (!deletableIds.length) {
    return { ok: true, deleted: 0, skipped: ids.length }
  }

  const result = await (prisma as any).order.updateMany({
    where: whereForStore({ id: { in: deletableIds } }, ctx) as any,
    data: { deletedAt: new Date() }
  })

  const deleted = Number(result?.count || 0)

  console.log('[bulk-delete] Deleted orders', {
    deleted,
    skipped: ids.length - deleted,
    adminEmail: session?.email,
    adminId: session?.id,
    ip,
    storeSlug: ctx?.storeSlug
  })

  // Gravar AuditLog
  if (deleted > 0 && session?.id) {
    await createAuditLog({
      action: 'ORDER_BULK_DELETE',
      entity: 'Order',
      entityId: deletableIds.join(','),
      adminId: session.id,
      adminEmail: session.email || 'unknown',
      details: JSON.stringify({
        deletedCount: deleted,
        orderNumbers: orders.map((o: any) => o.numero),
        orderIds: deletableIds,
        statuses: orders.map((o: any) => o.status)
      }),
      ip,
      userAgent,
      storeSlug: ctx?.storeSlug
    })
  }

  return {
    ok: true,
    deleted,
    skipped: ids.length - deleted
  }
})
