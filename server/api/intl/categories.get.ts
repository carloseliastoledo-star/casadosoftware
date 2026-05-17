import { defineEventHandler, setHeader } from 'h3'
import prisma from '../../db/prisma'

const STORE_SLUG = 'international'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
  try {
    const categorias = await (prisma as any).categoria.findMany({
      where: {
        ativo: true
      },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        slug: true,
        _count: {
          select: {
            ProdutoCategoria: true
          }
        }
      }
    })

    const comProdutos = categorias.filter((c: any) => c._count?.ProdutoCategoria > 0)

    console.log('[api/intl/categories] total:', categorias.length, '| com produtos:', comProdutos.length)
    categorias.forEach((c: any) => {
      console.log(`  slug=${c.slug} produtos=${c._count?.ProdutoCategoria}`)
    })

    return {
      ok: true,
      categorias: categorias.map((c: any) => ({
        id: c.id,
        nome: c.nome,
        slug: c.slug,
        produtoCount: c._count?.ProdutoCategoria ?? 0
      }))
    }
  } catch (err: any) {
    console.error('[api/intl/categories] error:', err?.message || err)
    return { ok: true, categorias: [] }
  }
})
