import { defineEventHandler, readBody, createError } from 'h3'
import { randomUUID } from 'crypto'
import { requireAdminSession } from '../../../utils/adminSession.js'
import prisma from '../../../db/prisma.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body = await readBody(event)
  const {
    customerName,
    productName,
    productId,
    rating,
    comment,
    source = 'manual',
    verified = true,
    published = false
  } = body

  if (!customerName || !productName || !rating || !comment) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campos obrigatórios: customerName, productName, rating, comment'
    })
  }

  if (rating < 1 || rating > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rating deve ser entre 1 e 5'
    })
  }

  try {
    const review = await (prisma as any).review.create({
      data: {
        id: randomUUID(),
        customerName: String(customerName),
        productName: String(productName),
        productId: productId ? String(productId) : null,
        rating: Number(rating),
        comment: String(comment),
        source: String(source),
        verified: Boolean(verified),
        published: Boolean(published)
      }
    })

    return {
      ok: true,
      review
    }
  } catch (err: any) {
    console.error('[admin reviews] Error creating review:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao criar avaliação'
    })
  }
})
