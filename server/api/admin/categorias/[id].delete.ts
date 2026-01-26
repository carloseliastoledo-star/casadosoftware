import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  }

  await prisma.produtoCategoria.deleteMany({
    where: { categoriaId: id }
  })

  await prisma.categoria.delete({ where: { id } })

  return { ok: true }
})
