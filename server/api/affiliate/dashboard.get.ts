import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '#root/server/db/prisma'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const code = String((q as any)?.code || '').trim()

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Missing affiliate code' })
  }

  const affiliate = await (prisma as any).affiliate.findUnique({
    where: { refCode: code },
    select: { id: true, name: true, email: true, refCode: true, commissionRate: true, createdAt: true }
  })

  if (!affiliate) {
    throw createError({ statusCode: 404, statusMessage: 'Affiliate not found' })
  }

  const [totalSales, totalCommissionAgg, pendingCommissionAgg, paidCommissionAgg] = await Promise.all([
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
      where: { affiliateId: affiliate.id, status: 'paid' },
      _sum: { amount: true }
    })
  ])

  const totalCommission = Number((totalCommissionAgg as any)?._sum?.amount ?? 0)
  const pendingCommission = Number((pendingCommissionAgg as any)?._sum?.amount ?? 0)
  const paidCommission = Number((paidCommissionAgg as any)?._sum?.amount ?? 0)

  return {
    ok: true,
    affiliate,
    totals: {
      totalSales,
      totalCommission,
      pendingCommission,
      paidCommission
    },
    affiliateLink: `https://casadosoftware.com.br/?ref=${encodeURIComponent(String(affiliate.refCode || code))}`
  }
})
