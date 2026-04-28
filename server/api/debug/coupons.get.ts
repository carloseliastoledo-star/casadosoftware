import { defineEventHandler } from 'h3'
import prisma from '#root/server/db/prisma'

export default defineEventHandler(async (event) => {
  // List all coupons with their data for debugging
  const cupons = await prisma.cupom.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
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
