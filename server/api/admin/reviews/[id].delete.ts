import { defineEventHandler, createError } from 'h3'
import { requireAdminSession } from '../../../utils/adminSession'
import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(event.context.params?.id || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da avaliação é obrigatório'
    })
  }

  try {
    await (prisma as any).review.delete({
      where: { id }
    })

    return {
      ok: true
    }
  } catch (err: any) {
    console.error('[admin reviews] Error deleting review:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao excluir avaliação'
    })
  }
})
