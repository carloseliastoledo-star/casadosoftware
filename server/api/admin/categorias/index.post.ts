import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body = await readBody(event)
  const nome = String(body?.nome || '').trim()
  const slug = String(body?.slug || '').trim()

  if (!nome || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'nome e slug são obrigatórios' })
  }

  const created = await prisma.categoria.create({
    data: { nome, slug },
    select: { id: true, nome: true, slug: true, ativo: true }
  })

  return { ok: true, categoria: created }
})
