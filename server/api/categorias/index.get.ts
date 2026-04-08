import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async () => {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        slug: true
      }
    })
    return { ok: true, categorias }
  } catch (err: any) {
    console.error('[api][categorias] db error', err?.message || err)
    return { ok: true, categorias: [] }
  }
})
