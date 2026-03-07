import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const body = await readBody(event)

  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const refCode = String(body?.refCode || '').trim()
  const commissionRate = Number(body?.commissionRate)

  if (!name) throw createError({ statusCode: 400, statusMessage: 'name obrigatório' })
  if (!email || !email.includes('@')) throw createError({ statusCode: 400, statusMessage: 'email inválido' })
  if (!refCode) throw createError({ statusCode: 400, statusMessage: 'refCode obrigatório' })
  if (!Number.isFinite(commissionRate) || commissionRate <= 0 || commissionRate > 1) {
    throw createError({ statusCode: 400, statusMessage: 'commissionRate inválido (0-1)' })
  }

  const affiliate = await (prisma as any).affiliate.upsert({
    where: { email },
    create: { name, email, refCode, commissionRate, isActive: false },
    update: { name, refCode, commissionRate },
    select: { id: true }
  })

  return { ok: true, id: affiliate.id }
})
