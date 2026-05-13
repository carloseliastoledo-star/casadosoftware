import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdminSession } from '../../../../utils/adminSession'
import prisma from '../../../../db/prisma'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(event.context.params?.id || '')
  const body = await readBody(event)
  const {
    customerName,
    productName,
    productId,
    rating,
    comment,
    source,
    verified,
    published
  } = body

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da avaliação é obrigatório'
    })
  }

  if (rating !== undefined && (rating < 1 || rating > 5)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rating deve ser entre 1 e 5'
    })
  }

  try {
    const updateData: any = {}

    if (customerName !== undefined) updateData.customerName = String(customerName)
    if (productName !== undefined) updateData.productName = String(productName)
    if (productId !== undefined) updateData.productId = productId ? String(productId) : null
    if (rating !== undefined) updateData.rating = Number(rating)
    if (comment !== undefined) updateData.comment = String(comment)
    if (source !== undefined) updateData.source = String(source)
    if (verified !== undefined) updateData.verified = Boolean(verified)
    if (published !== undefined) updateData.published = Boolean(published)

    const review = await (prisma as any).review.update({
      where: { id },
      data: updateData
    })

    return {
      ok: true,
      review
    }
  } catch (err: any) {
    console.error('[admin reviews] Error updating review:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao atualizar avaliação'
    })
  }
})
