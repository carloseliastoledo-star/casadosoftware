import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const body = await readBody(event)
  const refCode = String(body?.refCode || '').trim()
  const amount = Number(body?.amount)

  if (!refCode) throw createError({ statusCode: 400, statusMessage: 'refCode obrigatório' })
  if (!Number.isFinite(amount) || amount <= 0) throw createError({ statusCode: 400, statusMessage: 'amount inválido' })

  const affiliate = await (prisma as any).affiliate.findUnique({
    where: { refCode },
    select: { id: true, name: true, email: true }
  })

  if (!affiliate) throw createError({ statusCode: 404, statusMessage: 'Afiliado não encontrado' })

  const commission = await (prisma as any).affiliateCommission.create({
    data: {
      orderId: `MANUAL-${Date.now()}`,
      affiliateId: affiliate.id,
      amount,
      status: 'pending',
      availableAt: new Date(),
      createdAt: new Date()
    }
  })

  return { ok: true, commission, affiliate }
})
