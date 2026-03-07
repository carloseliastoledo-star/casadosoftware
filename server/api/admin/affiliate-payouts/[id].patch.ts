import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const id = Number((event.context.params as any)?.id)
  if (!Number.isFinite(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'id inválido' })

  const body = await readBody(event)
  const status = String(body?.status || '').trim()

  if (!status) throw createError({ statusCode: 400, statusMessage: 'status obrigatório' })

  const allowed = new Set(['requested', 'approved', 'rejected', 'paid'])
  if (!allowed.has(status)) {
    throw createError({ statusCode: 400, statusMessage: 'status inválido' })
  }

  await (prisma as any).affiliatePayoutRequest.update({
    where: { id },
    data: { status },
    select: { id: true }
  })

  return { ok: true }
})
