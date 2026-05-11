import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '../../../../db/prisma'
import { requireAdminSession } from '../../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const id = Number((event.context.params as any)?.id)
  if (!Number.isFinite(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'id inválido' })

  const body = await readBody(event)
  const amount = Number(body?.amount)
  const note = String(body?.note || '').trim()

  if (!Number.isFinite(amount) || amount <= 0) throw createError({ statusCode: 400, statusMessage: 'amount inválido' })

  const affiliate = await (prisma as any).affiliate.findUnique({
    where: { id },
    select: { id: true, name: true, email: true }
  })

  if (!affiliate) throw createError({ statusCode: 404, statusMessage: 'Afiliado não encontrado' })

  const commission = await (prisma as any).affiliateCommission.create({
    data: {
      orderId: `MANUAL-${Date.now()}`,
      affiliateId: id,
      amount,
      status: 'pending',
      availableAt: new Date(),
      createdAt: new Date()
    }
  })

  return { ok: true, commission }
})
