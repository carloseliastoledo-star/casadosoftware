import { defineEventHandler, createError } from 'h3'
import prisma from '../../../../db/prisma'
import { requireAdminSession } from '../../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const id = Number((event.context.params as any)?.id)
  if (!Number.isFinite(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'id inválido' })

  const now = new Date()

  await (prisma as any).affiliateCommission.updateMany({
    where: {
      affiliateId: id,
      status: 'pending',
      availableAt: { lte: now }
    },
    data: {
      status: 'paid',
      paidAt: now
    }
  })

  return { ok: true }
})
