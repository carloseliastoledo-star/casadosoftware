import { defineEventHandler, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const id = Number((event.context.params as any)?.id)
  if (!Number.isFinite(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'id inválido' })

  const affiliate = await (prisma as any).affiliate.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, refCode: true, commissionRate: true, isActive: true, createdAt: true }
  })

  if (!affiliate) throw createError({ statusCode: 404, statusMessage: 'Afiliado não encontrado' })

  const now = new Date()

  const [totalSales, totalCommissionAgg, pendingAllAgg, availableAgg, paidAgg] = await Promise.all([
    (prisma as any).order.count({ where: { affiliateId: id, status: 'PAID' } }),
    (prisma as any).affiliateCommission.aggregate({ where: { affiliateId: id }, _sum: { amount: true } }),
    (prisma as any).affiliateCommission.aggregate({ where: { affiliateId: id, status: 'pending' }, _sum: { amount: true } }),
    (prisma as any).affiliateCommission.aggregate({ where: { affiliateId: id, status: 'pending', availableAt: { lte: now } }, _sum: { amount: true } }),
    (prisma as any).affiliateCommission.aggregate({ where: { affiliateId: id, status: 'paid' }, _sum: { amount: true } })
  ])

  const totalCommission = round2(Number((totalCommissionAgg as any)?._sum?.amount ?? 0))
  const pendingCommission = round2(Number((pendingAllAgg as any)?._sum?.amount ?? 0))
  const availableCommission = round2(Number((availableAgg as any)?._sum?.amount ?? 0))
  const paidCommission = round2(Number((paidAgg as any)?._sum?.amount ?? 0))

  return {
    ok: true,
    affiliate: {
      ...affiliate,
      stats: {
        totalSales,
        totalCommission,
        pendingCommission,
        availableCommission,
        paidCommission
      }
    }
  }
})
