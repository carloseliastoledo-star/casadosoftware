import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma.js'
import { requireAffiliateSession } from '../../utils/affiliateSession.js'

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export default defineEventHandler(async (event) => {
  const session = requireAffiliateSession(event)
  console.log('[affiliate dashboard] session:', session)

  const affiliateRaw = await (prisma as any).affiliate.findUnique({
    where: { id: session.affiliateId },
    select: { id: true, name: true, email: true, code: true, commissionRate: true, createdAt: true }
  })
  console.log('[affiliate dashboard] affiliateRaw:', affiliateRaw)

  // Mapear code para refCode para compatibilidade
  const affiliate = affiliateRaw ? { ...affiliateRaw, refCode: affiliateRaw.code } : null

  if (!affiliate) {
    console.log('[affiliate dashboard] affiliate not found')
    return { ok: false }
  }

  const now = new Date()

  const [totalSales, totalCommissionAgg, pendingAllAgg, availableAgg, paidAgg, totalRevenueAgg] = await Promise.all([
    (prisma as any).order.count({
      where: {
        affiliateId: affiliate.id,
        status: 'PAID'
      }
    }),
    (prisma as any).affiliateCommission.aggregate({
      where: { affiliateId: affiliate.id },
      _sum: { amount: true }
    }),
    (prisma as any).affiliateCommission.aggregate({
      where: { affiliateId: affiliate.id, status: 'pending' },
      _sum: { amount: true }
    }),
    (prisma as any).affiliateCommission.aggregate({
      where: { affiliateId: affiliate.id, status: 'pending', availableAt: { lte: now } },
      _sum: { amount: true }
    }),
    (prisma as any).affiliateCommission.aggregate({
      where: { affiliateId: affiliate.id, status: 'paid' },
      _sum: { amount: true }
    }),
    (prisma as any).order.aggregate({
      where: { affiliateId: affiliate.id, status: 'PAID' },
      _sum: { totalAmount: true }
    })
  ])

  const totalCommission = Number((totalCommissionAgg as any)?._sum?.amount ?? 0)
  const pendingCommission = Number((pendingAllAgg as any)?._sum?.amount ?? 0)
  const availableCommission = Number((availableAgg as any)?._sum?.amount ?? 0)
  const paidCommission = Number((paidAgg as any)?._sum?.amount ?? 0)
  const totalRevenue = Number((totalRevenueAgg as any)?._sum?.totalAmount ?? 0)

  const lockedCommission = Math.max(0, round2(pendingCommission - availableCommission))

  return {
    ok: true,
    affiliate,
    totals: {
      totalSales,
      totalRevenue,
      totalCommission,
      pendingCommission,
      availableCommission,
      lockedCommission,
      paidCommission
    },
    affiliateLink: `https://casadosoftware.com.br/?ref=${encodeURIComponent(String(affiliate.refCode || ''))}`
  }
})
