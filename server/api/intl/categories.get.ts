import { defineEventHandler, setHeader } from 'h3'
import prisma from '../../db/prisma'

const STORE_SLUG = 'international'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  try {
    const categorias = await (prisma as any).categoria.findMany({
      where: {
        storeSlug: STORE_SLUG,
        ativo: true,
        ProdutoCategoria: {
          some: {
            Produto: {
              storeSlug: STORE_SLUG,
              ativo: true
            }
          }
        }
      },
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
    console.error('[api/intl/categories] error:', err?.message || err)
    return { ok: true, categorias: [] }
  }
})
