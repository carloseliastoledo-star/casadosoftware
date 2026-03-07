import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const vendors = await (prisma as any).vendor.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, createdAt: true }
  })

  return { ok: true, vendors }
})
