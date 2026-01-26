import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async () => {
  const categorias = await prisma.categoria.findMany({
    orderBy: { nome: 'asc' },
    select: {
      id: true,
      nome: true,
      slug: true
    }
  })

  return { ok: true, categorias }
})
