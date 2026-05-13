import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const productId = String(query?.productId || '').trim()

  try {
    const where: any = {
      published: true
    }

    if (productId) {
      where.productId = productId
    }

    const reviews = await (prisma as any).review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        customerName: true,
        productName: true,
        productId: true,
        rating: true,
        comment: true,
        verified: true,
        createdAt: true
      }
    })

    // Calcular estatísticas
    const allReviews = await (prisma as any).review.findMany({
      where,
      select: { rating: true }
    })

    const totalReviews = allReviews.length
    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
      : 0

    return {
      ok: true,
      reviews,
      stats: {
        total: totalReviews,
        average: Math.round(averageRating * 10) / 10
      }
    }
  } catch (err: any) {
    // Se a tabela não existir, retornar dados vazios para não quebrar o frontend
    if (err?.code === 'P2021' || err?.message?.includes('does not exist') || err?.message?.includes("Unknown table")) {
      console.log('[reviews] Table does not exist yet, returning empty data')
      return {
        ok: true,
        reviews: [],
        stats: {
          total: 0,
          average: 0
        }
      }
    }

    console.error('[reviews] Error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao carregar avaliações'
    })
  }
})
