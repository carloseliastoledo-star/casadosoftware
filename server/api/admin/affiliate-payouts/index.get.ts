import { defineEventHandler, getQuery } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const q = getQuery(event)
  const status = String((q as any)?.status || '').trim()

  const where: any = {}
  if (status) where.status = status

  const payouts = await (prisma as any).affiliatePayoutRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      affiliateId: true,
      amount: true,
      status: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      affiliate: {
        select: { id: true, name: true, email: true, refCode: true }
      }
    }
  })

  return { ok: true, payouts }
})
