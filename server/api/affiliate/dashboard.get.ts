import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'
import { requireAffiliateSession } from '../../utils/affiliateSession'

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export default defineEventHandler(async (event) => {
  const session = requireAffiliateSession(event)

  const affiliate = await (prisma as any).affiliate.findUnique({
    where: { id: session.affiliateId },
    select: { id: true, name: true, email: true, refCode: true, commissionRate: true, createdAt: true }
  })

  if (!affiliate) {
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
