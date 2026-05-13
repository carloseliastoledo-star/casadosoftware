import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdminSession } from '../../../../utils/adminSession'
import prisma from '../../../../db/prisma'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(event.context.params?.id || '')
  const body = await readBody(event)
  const { published } = body

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da avaliação é obrigatório'
    })
  }

  if (published === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campo published é obrigatório'
    })
  }

  try {
    const review = await (prisma as any).review.update({
      where: { id },
      data: {
        published: Boolean(published)
      }
    })

    return {
      ok: true,
      review
    }
  } catch (err: any) {
    console.error('[admin reviews] Error updating publish status:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao atualizar status de publicação'
    })
  }
})
