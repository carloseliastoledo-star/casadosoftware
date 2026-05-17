import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)
  const body = await readBody(event)
  const nome = String(body?.nome || '').trim()
  const slug = String(body?.slug || '').trim()

  if (!nome || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'nome e slug são obrigatórios' })
  }

  const created = await (prisma as any).categoria.create({
    data: { nome, slug, storeSlug: storeSlug || 'casadosoftware' },
    select: { id: true, storeSlug: true, nome: true, slug: true, ativo: true }
  })

  return { ok: true, categoria: created }
})
