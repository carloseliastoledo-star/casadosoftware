import { defineEventHandler, getRouterParam } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext, whereForStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const ctx = getStoreContext(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) {
    return { ok: true, deleted: 0 }
  }

  const result = await prisma.licenca.deleteMany({
    where: whereForStore(
      {
        id,
        status: 'STOCK',
        orderId: null,
        customerId: null
      },
      ctx
    ) as any
  })

  return { ok: true, deleted: result.count }
})
