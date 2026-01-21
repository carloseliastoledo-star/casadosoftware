import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const query = getQuery(event)
  const produtoId = String((query as any)?.produtoId || '').trim()
  const page = Math.max(1, Number((query as any)?.page || 1))
  const pageSize = Math.min(200, Math.max(10, Number((query as any)?.pageSize || 100)))

  if (!produtoId) {
    throw createError({ statusCode: 400, statusMessage: 'produtoId obrigatório' })
  }

  const where = {
    produtoId,
    status: 'STOCK',
    orderId: null,
    customerId: null
  } as const

  const [total, items] = await Promise.all([
    prisma.licenca.count({ where }),
    prisma.licenca.findMany({
      where,
      select: { id: true, chave: true, status: true },
      orderBy: { id: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ])

  return {
    ok: true,
    page,
    pageSize,
    total,
    items
  }
})
