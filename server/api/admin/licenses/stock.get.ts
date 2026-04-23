import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext, whereForStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const ctx = getStoreContext(event)

  const grouped = await prisma.licenca.groupBy({
    by: ['produtoId'],
    where: whereForStore({ status: 'STOCK', orderId: null, customerId: null }, ctx) as any,
    _count: { _all: true }
  })

  const produtoIds = grouped.map((g) => g.produtoId)

  const produtos = await prisma.produto.findMany({
    where: { id: { in: produtoIds } },
    select: { id: true, nome: true, slug: true }
  })

  const map = new Map(produtos.map((p) => [p.id, p]))

  const items = grouped
    .map((g) => {
      const produto = map.get(g.produtoId) || null
      return {
        produtoId: g.produtoId,
        produto,
        count: g._count._all
      }
    })
    .sort((a, b) => b.count - a.count)

  const total = items.reduce((acc, it) => acc + it.count, 0)

  return { ok: true, total, items }
})
