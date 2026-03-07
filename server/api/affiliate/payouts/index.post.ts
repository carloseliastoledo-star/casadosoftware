import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAffiliateSession } from '../../../utils/affiliateSession'

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export default defineEventHandler(async (event) => {
  const session = requireAffiliateSession(event)
  const body = await readBody(event)

  const rawAmount = body?.amount
  const amount = round2(Number(rawAmount))

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Valor inválido' })
  }

  const note = body?.note != null ? String(body.note).trim() : null

  const now = new Date()
  const availableAgg = await (prisma as any).affiliateCommission.aggregate({
    where: {
      affiliateId: session.affiliateId,
      status: 'pending',
      availableAt: { lte: now }
    },
    _sum: { amount: true }
  })

  const available = round2(Number((availableAgg as any)?._sum?.amount ?? 0))
  if (amount > available) {
    throw createError({ statusCode: 400, statusMessage: 'Saldo insuficiente' })
  }

  const created = await (prisma as any).affiliatePayoutRequest.create({
    data: {
      affiliateId: session.affiliateId,
      amount,
      status: 'requested',
      note
    },
    select: { id: true }
  })

  return { ok: true, id: created.id }
})
