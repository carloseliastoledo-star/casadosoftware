import { defineEventHandler, setHeader } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async (event) => {
  const startedAt = Date.now()
  setHeader(event, 'Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
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
    console.error('[api/categorias] error:', err?.message || err)
    return { ok: true, categorias: [] }
  } finally {
    console.log('[api/categorias] loaded in', Date.now() - startedAt, 'ms')
  }
})
