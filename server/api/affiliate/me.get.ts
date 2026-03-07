import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'
import { requireAffiliateSession } from '../../utils/affiliateSession'

export default defineEventHandler(async (event) => {
  const session = requireAffiliateSession(event)

  const affiliate = await (prisma as any).affiliate.findUnique({
    where: { id: session.affiliateId },
    select: { id: true, name: true, email: true, refCode: true, commissionRate: true, createdAt: true }
  })

  if (!affiliate) {
    return { ok: false }
  }

  return { ok: true, affiliate }
})
