import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const categorias = await prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    select: {
      id: true,
      nome: true,
      slug: true,
      ativo: true
    }
  })

  return { ok: true, categorias }
})
