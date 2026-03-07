import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'
import { requireAffiliateSession } from '../../utils/affiliateSession'

export default defineEventHandler(async (event) => {
  const session = requireAffiliateSession(event)

  const commissions = await (prisma as any).affiliateCommission.findMany({
    where: { affiliateId: session.affiliateId },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      orderId: true,
      amount: true,
      status: true,
      availableAt: true,
      paidAt: true,
      createdAt: true
    }
  })

  const orderIds = commissions.map((c: any) => String(c.orderId)).filter(Boolean)
  const uniqueOrderIds = Array.from(new Set(orderIds))

  const orders = uniqueOrderIds.length
    ? await (prisma as any).order.findMany({
        where: { id: { in: uniqueOrderIds } },
        select: {
          id: true,
          numero: true,
          totalAmount: true,
          currency: true,
          pagoEm: true,
          produto: { select: { id: true, nome: true, slug: true } }
        }
      })
    : []

  const byId = new Map(orders.map((o: any) => [String(o.id), o]))

  const enriched = commissions.map((c: any) => ({
    ...c,
    order: byId.get(String(c.orderId)) || null
  }))

  return { ok: true, commissions: enriched }
})
