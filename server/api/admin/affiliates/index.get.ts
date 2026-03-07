import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const affiliates = await (prisma as any).affiliate.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, refCode: true, commissionRate: true, isActive: true, createdAt: true }
  })

  return { ok: true, affiliates }
})
