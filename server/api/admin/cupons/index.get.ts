import { defineEventHandler } from 'h3'
import prisma from '#root/server/db/prisma'
import { requireAdminSession } from '#root/server/utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const cupons = await prisma.cupom.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      id: true,
      code: true,
      percent: true,
      active: true,
      startsAt: true,
      expiresAt: true,
      maxUses: true,
      usedCount: true,
      createdAt: true
    }
  })

  return { ok: true, cupons }
})
