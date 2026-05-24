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
  if (typeof body?.nome === 'string') data.nome = body.nome.trim()
  if (typeof body?.slug === 'string') data.slug = body.slug.trim()
  if (typeof body?.ativo === 'boolean') data.ativo = body.ativo

  if (!data.nome && !data.slug && typeof data.ativo !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Nada para atualizar' })
  }

  const updated = await prisma.categoria.update({
    where: { id },
    data,
    select: { id: true, nome: true, slug: true, ativo: true }
  })

  return { ok: true, categoria: updated }
})
