import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'
import { getStoreContext } from '../../../utils/store.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)
  const prismaAny = prisma as any

  const items = await prismaAny.partnerApplication.findMany({
    where: { storeSlug },
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

  const emails = items.map((it: any) => String(it.email || '').trim().toLowerCase()).filter(Boolean)

  const affiliatesRaw = emails.length
    ? await prismaAny.affiliate.findMany({
        where: { storeSlug, email: { in: emails } },
        select: { email: true, code: true, commissionRate: true }
      })
    : []

  // Mapear code para refCode para compatibilidade
  const affiliates = affiliatesRaw.map((a: any) => ({ ...a, refCode: a.code }))

  const affiliateMap = new Map(
    affiliates.map((a: any) => [String(a.email).toLowerCase(), a])
  )

  const enriched = items.map((it: any) => {
    const aff = affiliateMap.get(String(it.email || '').trim().toLowerCase())
    return {
      ...it,
      approved: Boolean(aff),
      affiliateRefCode: aff?.refCode || null,
      affiliateCommissionRate: aff?.commissionRate ?? null
    }
  })

  return { ok: true, items: enriched }
})
