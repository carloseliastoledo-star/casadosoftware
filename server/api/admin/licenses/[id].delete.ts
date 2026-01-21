import { defineEventHandler, getRouterParam } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) {
    return { ok: true, deleted: 0 }
  }

  const result = await prisma.licenca.deleteMany({
    where: {
      id,
      status: 'STOCK',
      orderId: null,
      customerId: null
    }
  })

  return { ok: true, deleted: result.count }
})
