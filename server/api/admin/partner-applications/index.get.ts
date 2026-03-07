import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const prismaAny = prisma as any

  const items = await prismaAny.partnerApplication.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      website: true,
      social: true,
      country: true,
      monthlyTraffic: true,
      promotionPlan: true,
      createdAt: true
    }
  })

  return { ok: true, items }
})
