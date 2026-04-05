import { defineEventHandler, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(event.context.params?.id || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })

  const existing = await (prisma as any).seoPage.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Página não encontrada' })

  await (prisma as any).seoPage.delete({ where: { id } })

  return { ok: true }
})
