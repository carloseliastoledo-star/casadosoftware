import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAffiliateSession } from '../../../utils/affiliateSession'

export default defineEventHandler(async (event) => {
  const session = requireAffiliateSession(event)

  const payouts = await (prisma as any).affiliatePayoutRequest.findMany({
    where: { affiliateId: session.affiliateId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      amount: true,
      status: true,
      note: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return { ok: true, payouts }
})
