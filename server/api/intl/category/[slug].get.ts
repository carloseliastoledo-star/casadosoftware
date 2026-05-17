import { defineEventHandler, getRouterParam, createError, setHeader } from 'h3'
import prisma from '../../../db/prisma'

function normalizeImageUrl(input: unknown): string | null {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  if (raw.startsWith('http://')) return raw.replace(/^http:\/\//, 'https://')
  if (raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`
  if (raw.startsWith('/')) return raw
  return raw
}

function mapSlugToName(slug: string): string {
  const map: Record<string, string> = {
    'windows': 'Windows',
    'office': 'Office',
    'windows-server': 'Windows Server',
    'adobe': 'Adobe',
    'autodesk': 'Autodesk',
    'games': 'Games',
    'electronics': 'Electronics',
  }
  return map[slug] || slug
}

function buildCommercialWhere(slug: string): any {
  const base = { ativo: true }
  switch (slug) {
    case 'windows':
      return {
        ...base,
        nome: { contains: 'Windows', mode: 'insensitive' as const },
        NOT: { nome: { contains: 'Server', mode: 'insensitive' as const } }
      }
    case 'windows-server':
      return {
        ...base,
        nome: { contains: 'Windows Server', mode: 'insensitive' as const }
      }
    case 'office':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Office', mode: 'insensitive' as const } },
          { nome: { contains: 'Microsoft 365', mode: 'insensitive' as const } },
          { nome: { contains: '365', mode: 'insensitive' as const } }
        ]
      }
    case 'adobe':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Adobe', mode: 'insensitive' as const } },
          { nome: { contains: 'Photoshop', mode: 'insensitive' as const } },
          { nome: { contains: 'Illustrator', mode: 'insensitive' as const } },
          { nome: { contains: 'Creative Cloud', mode: 'insensitive' as const } },
          { nome: { contains: 'Acrobat', mode: 'insensitive' as const } }
        ]
      }
    case 'autodesk':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Autodesk', mode: 'insensitive' as const } },
          { nome: { contains: 'AutoCAD', mode: 'insensitive' as const } },
          { nome: { contains: '3DS Max', mode: 'insensitive' as const } },
          { nome: { contains: 'SketchUp', mode: 'insensitive' as const } }
        ]
      }
    case 'games':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Steam', mode: 'insensitive' as const } },
          { nome: { contains: 'Xbox', mode: 'insensitive' as const } },
          { nome: { contains: 'PSN', mode: 'insensitive' as const } },
          { nome: { contains: 'EA SPORTS', mode: 'insensitive' as const } },
          { nome: { contains: 'Battlefield', mode: 'insensitive' as const } },
          { nome: { contains: 'ARC Raiders', mode: 'insensitive' as const } },
          { nome: { contains: 'Game', mode: 'insensitive' as const } }
        ]
      }
    case 'electronics':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Keyboard', mode: 'insensitive' as const } },
          { nome: { contains: 'Router', mode: 'insensitive' as const } },
          { nome: { contains: 'Mouse', mode: 'insensitive' as const } },
          { nome: { contains: 'Monitor', mode: 'insensitive' as const } },
          { nome: { contains: 'Headset', mode: 'insensitive' as const } },
          { nome: { contains: 'Webcam', mode: 'insensitive' as const } },
          { nome: { contains: 'Electronics', mode: 'insensitive' as const } }
        ]
      }
    default:
      return null
  }
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')

  // Esta API é específica da loja internacional — sempre buscar storeSlug='international'
  const resolvedStore = 'international'

  const slug = String(getRouterParam(event, 'slug') || '').trim().toLowerCase()
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })

  try {
    console.log('[intl/category] slug=', slug, 'resolvedStore=', resolvedStore)

    // 1. Tentar como categoria técnica (slug real no banco)
    const categoriaDb = await (prisma as any).categoria.findFirst({
      where: { slug, storeSlug: resolvedStore, ativo: true },
      select: { id: true, nome: true, slug: true }
    })

    console.log('[intl/category] categoriaDb=', categoriaDb ? 'found' : 'not found')

    let produtosRaw: any[] = []

    if (categoriaDb) {
      // Categoria existe → buscar produtos por relação
      produtosRaw = await (prisma as any).produto.findMany({
        where: {
          storeSlug: resolvedStore,
          ativo: true,
          ProdutoCategoria: { some: { categoriaId: categoriaDb.id } }
        },
        select: {
          id: true, nome: true, nomeEn: true, slug: true,
          imagem: true, cardItems: true, criadoEm: true,
          ProdutoPrecoMoeda: {
            where: { storeSlug: resolvedStore },
            select: { currency: true, amount: true, oldAmount: true }
          }
        }
      })
      console.log('[intl/category] relation products=', produtosRaw.length)
      // Fallback: se nenhum produto vinculado, tentar buscar por nome
      if (produtosRaw.length === 0) {
        const commercialWhere = buildCommercialWhere(slug)
        console.log('[intl/category] fallback where=', JSON.stringify(commercialWhere))
        if (commercialWhere) {
          produtosRaw = await (prisma as any).produto.findMany({
            where: { storeSlug: resolvedStore, ...commercialWhere },
            select: {
              id: true, nome: true, nomeEn: true, slug: true,
              imagem: true, cardItems: true, criadoEm: true,
              ProdutoPrecoMoeda: {
                where: { storeSlug: resolvedStore },
                select: { currency: true, amount: true, oldAmount: true }
              }
            }
          })
          console.log('[intl/category] fallback products=', produtosRaw.length)
        }
      }
    } else {
      // 2. Tentar como categoria comercial (filtro por nome)
      const commercialWhere = buildCommercialWhere(slug)
      console.log('[intl/category] direct where=', JSON.stringify(commercialWhere))
      if (!commercialWhere) {
        throw createError({ statusCode: 404, statusMessage: 'Category not found' })
      }
      produtosRaw = await (prisma as any).produto.findMany({
        where: { storeSlug: resolvedStore, ...commercialWhere },
        select: {
          id: true, nome: true, nomeEn: true, slug: true,
          imagem: true, cardItems: true, criadoEm: true,
          ProdutoPrecoMoeda: {
            where: { storeSlug: resolvedStore },
            select: { currency: true, amount: true, oldAmount: true }
          }
        }
      })
      console.log('[intl/category] direct products=', produtosRaw.length)
    }

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

    console.log('[intl/category] final products after price filter=', produtos.length)

    const categoria = categoriaDb || {
      id: slug,
      nome: mapSlugToName(slug),
      slug
    }

    return { ok: true, categoria, produtos }

  } catch (error: any) {
    if (error?.statusCode === 404) throw error
    throw createError({ statusCode: 503, statusMessage: `Error: ${error?.message || 'Unknown error'}` })
  }
})
