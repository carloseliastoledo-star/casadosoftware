import { defineEventHandler, setHeader } from 'h3'
import prisma from '../../db/prisma'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  const startedAt = Date.now()
  setHeader(event, 'Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
  try {
    const { storeSlug } = getStoreContext(event)
    const categorias = await (prisma as any).categoria.findMany({
      where: { ativo: true, ...(storeSlug ? { storeSlug } : {}) },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        slug: true,
        storeSlug: true
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
