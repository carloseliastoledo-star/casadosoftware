import { defineEventHandler, getRouterParam, createError, setHeader } from 'h3'
import prisma from '../../../db/prisma'
import { getStoreContext } from '#root/server/utils/store'

function normalizeImageUrl(input: unknown): string | null {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  if (raw.startsWith('http://')) return raw.replace(/^http:\/\//, 'https://')
  if (raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`
  if (raw.startsWith('/')) return raw
  return raw
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')

  const { storeSlug } = getStoreContext(event)
  const resolvedStore = storeSlug || 'international'

  const slug = String(getRouterParam(event, 'slug') || '').trim().toLowerCase()
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })

  try {
    // Buscar categoria pelo slug + storeSlug
    const categoria = await (prisma as any).categoria.findFirst({
      where: { slug, storeSlug: resolvedStore, ativo: true },
      select: { id: true, nome: true, slug: true }
    })

    if (!categoria) throw createError({ statusCode: 404, statusMessage: 'Category not found' })

    // Buscar produtos da categoria com preços USD e EUR
    const produtosRaw = await (prisma as any).produto.findMany({
      where: {
        storeSlug: resolvedStore,
        ativo: true,
        ProdutoCategoria: { some: { categoriaId: categoria.id } }
      },
      select: {
        id: true,
        nome: true,
        nomeEn: true,
        slug: true,
        imagem: true,
        cardItems: true,
        criadoEm: true,
        ProdutoPrecoMoeda: {
          where: { storeSlug: resolvedStore },
          select: { currency: true, amount: true, oldAmount: true }
        }
      }
    })

    const produtos = produtosRaw.map((p: any) => {
      const precos: any[] = p.ProdutoPrecoMoeda || []
      const usd = precos.find((x: any) => String(x.currency).toLowerCase() === 'usd')
      const eur = precos.find((x: any) => String(x.currency).toLowerCase() === 'eur')
      const usdPrice = usd ? Number(usd.amount) : null
      const oldUsdPrice = usd?.oldAmount ? Number(usd.oldAmount) : null
      const eurPrice = eur ? Number(eur.amount) : null
      return {
        id: p.id,
        name: p.nomeEn || p.nome,
        slug: p.slug,
        price: usdPrice,
        usdPrice,
        oldUsdPrice,
        eurPrice,
        precoAntigo: oldUsdPrice,
        currency: 'usd',
        storeSlug: resolvedStore,
        image: normalizeImageUrl(p.imagem),
        imagem: normalizeImageUrl(p.imagem),
        cardItems: p.cardItems,
        createdAt: p.criadoEm
      }
    }).filter((p: any) => p.usdPrice != null && p.usdPrice > 0)

    return { ok: true, categoria, produtos }

  } catch (error: any) {
    if (error?.statusCode === 404) throw error
    throw createError({ statusCode: 503, statusMessage: `Error: ${error?.message || 'Unknown error'}` })
  }
})
