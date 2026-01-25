import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  }

  const body = await readBody(event)

  const data: any = {}
  if (typeof body?.nome === 'string') data.nome = body.nome.trim() || null
  if (typeof body?.whatsapp === 'string') data.whatsapp = body.whatsapp.trim() || null
  if (typeof body?.cpf === 'string') data.cpf = body.cpf.trim() || null

  const updated = await prisma.customer.update({
    where: { id },
    data,
    select: { id: true, email: true, nome: true, whatsapp: true, cpf: true }
  })

  return { ok: true, customer: updated }
})
