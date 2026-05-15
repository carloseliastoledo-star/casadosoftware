import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma.js'
import { requireAffiliateSession } from '../../utils/affiliateSession.js'

export default defineEventHandler(async (event) => {
  const session = requireAffiliateSession(event)

  const affiliateRaw = await (prisma as any).affiliate.findUnique({
    where: { id: session.affiliateId },
    select: { id: true, name: true, email: true, code: true, commissionRate: true, createdAt: true }
  })
  
  // Mapear code para refCode para compatibilidade
  const affiliate = affiliateRaw ? { ...affiliateRaw, refCode: affiliateRaw.code } : null

  if (!affiliate) {
    return { ok: false }
  }

  return { ok: true, affiliate }
})
