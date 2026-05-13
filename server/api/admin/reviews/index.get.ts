import { defineEventHandler, getQuery, createError } from 'h3'
import { requireAdminSession } from '../../../utils/adminSession'
import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const query = getQuery(event)
  const productId = String(query?.productId || '').trim()
  const published = query?.published !== undefined ? String(query.published) === 'true' : undefined

  try {
    const where: any = {}

    if (productId) {
      where.productId = productId
    }

    if (published !== undefined) {
      where.published = published
    }

    const reviews = await (prisma as any).review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return {
      ok: true,
      reviews
    }
  } catch (err: any) {
    // Se a tabela não existir, retornar lista vazia
    if (err?.code === 'P2021' || err?.message?.includes('does not exist') || err?.message?.includes("Unknown table")) {
      console.log('[admin reviews] Table does not exist yet, returning empty list')
      return {
        ok: true,
        reviews: []
      }
    }

    console.error('[admin reviews] Error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao carregar avaliações'
    })
  }
})
