import { defineEventHandler, createError } from 'h3'
import prisma from '../../../../db/prisma'
import { requireAdminSession } from '../../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const refCode = String((event.context.params as any)?.refCode || '').trim()
  if (!refCode) throw createError({ statusCode: 400, statusMessage: 'refCode obrigatório' })

  const affiliate = await (prisma as any).affiliate.findUnique({
    where: { refCode },
    select: { id: true, name: true, email: true, refCode: true, commissionRate: true, isActive: true, createdAt: true }
  })

  if (!affiliate) throw createError({ statusCode: 404, statusMessage: 'Afiliado não encontrado' })

  return { ok: true, affiliate }
})
