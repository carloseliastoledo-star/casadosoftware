import { defineEventHandler, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(event.context.params?.id || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })

  const page = await (prisma as any).seoPage.findUnique({ where: { id } })
  if (!page) throw createError({ statusCode: 404, statusMessage: 'Página não encontrada' })

  return { ok: true, page }
})
