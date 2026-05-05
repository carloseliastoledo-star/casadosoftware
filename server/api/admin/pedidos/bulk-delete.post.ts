import { defineEventHandler, readBody } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext, whereForStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const ctx = getStoreContext(event)

  const body = await readBody(event)

  const idsRaw = Array.isArray(body?.ids) ? body.ids : []
  const ids = idsRaw.map((x: any) => String(x || '').trim()).filter(Boolean)

  if (!ids.length) {
    return { ok: true, deleted: 0, skipped: 0 }
  }

  const orders = await (prisma as any).order.findMany({
    where: whereForStore({ id: { in: ids }, deletedAt: null }, ctx) as any,
    select: { id: true }
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

  return {
    ok: true,
    deleted,
    skipped: ids.length - deleted
  }
})
