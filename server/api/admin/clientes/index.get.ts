import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const customers = await prisma.customer.findMany({
    orderBy: { criadoEm: 'desc' },
    take: 500,
    select: {
      id: true,
      email: true,
      nome: true,
      whatsapp: true,
      cpf: true,
      criadoEm: true
    }
  })

  const aggregates = await prisma.wooOrder.groupBy({
    by: ['customerId'],
    _count: { _all: true },
    _sum: { total: true }
  })

  const map = new Map<string, { count: number; sum: number }>()
  for (const a of aggregates) {
    map.set(a.customerId, {
      count: a._count._all,
      sum: a._sum.total ?? 0
    })
  }

  return {
    ok: true,
    customers: customers.map((c) => {
      const agg = map.get(c.id)
      return {
        ...c,
        wooOrdersCount: agg?.count ?? 0,
        wooTotalSpent: agg?.sum ?? 0
      }
    })
  }
})
