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

  const emails = items.map((it: any) => String(it.email || '').trim().toLowerCase()).filter(Boolean)

  const affiliates = emails.length
    ? await prismaAny.affiliate.findMany({
        where: { email: { in: emails } },
        select: { email: true, refCode: true, commissionRate: true }
      })
    : []

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
