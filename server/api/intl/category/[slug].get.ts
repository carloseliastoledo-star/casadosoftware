import { defineEventHandler, getRouterParam, getQuery, createError, setHeader } from 'h3'
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

function matchesCommercialSlug(slug: string, nome: string): boolean {
  const n = nome.toLowerCase()
  switch (slug) {
    case 'windows':
      return n.includes('windows') && !n.includes('server')
    case 'windows-server':
      return n.includes('windows server')
    case 'office':
      return n.includes('office') || n.includes('microsoft 365') || n.includes('365')
    case 'adobe':
      return n.includes('adobe') || n.includes('photoshop') || n.includes('illustrator') ||
             n.includes('creative cloud') || n.includes('acrobat')
    case 'autodesk':
      return n.includes('autodesk') || n.includes('autocad') || n.includes('3ds max') ||
             n.includes('sketchup')
    case 'games':
      return n.includes('steam') || n.includes('xbox') || n.includes('psn') ||
             n.includes('ea sports') || n.includes('battlefield') || n.includes('arc raiders') ||
             n.includes('game')
    case 'electronics':
      return n.includes('keyboard') || n.includes('router') || n.includes('mouse') ||
             n.includes('monitor') || n.includes('headset') || n.includes('webcam') ||
             n.includes('electronics')
    default:
      return false
  }
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')

  // Esta API é específica da loja internacional — sempre buscar storeSlug='international'
  const resolvedStore = 'international'

  const slug = String(getRouterParam(event, 'slug') || '').trim().toLowerCase()
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })

  const debug = String(getQuery(event)?.debug || '') === '1'

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
    }

    // 2. Fallback: buscar todos os produtos internacionais e filtrar por nome no JS
    if (produtosRaw.length === 0) {
      const todosProdutos = await (prisma as any).produto.findMany({
        where: { storeSlug: resolvedStore, ativo: true },
        select: {
          id: true, nome: true, nomeEn: true, slug: true,
          imagem: true, cardItems: true, criadoEm: true,
          ProdutoPrecoMoeda: {
            where: { storeSlug: resolvedStore },
            select: { currency: true, amount: true, oldAmount: true }
          }
        }
      })
      console.log('[intl/category] total intl products=', todosProdutos.length)
      produtosRaw = todosProdutos.filter((p: any) => matchesCommercialSlug(slug, p.nome))
      console.log('[intl/category] after JS filter=', produtosRaw.length)
    }

    const produtosComPreco = produtosRaw.map((p: any) => {
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
    })

    const produtos = produtosComPreco.filter((p: any) => p.usdPrice != null && p.usdPrice > 0)

    console.log('[intl/category] final products after price filter=', produtos.length)

    const categoria = categoriaDb || {
      id: slug,
      nome: mapSlugToName(slug),
      slug
    }

    if (debug) {
      return {
        ok: true,
        categoria,
        produtos,
        _debug: {
          totalBeforePriceFilter: produtosRaw.length,
          afterPriceFilter: produtos.length,
          sampleProducts: produtosRaw.slice(0, 5).map((p: any) => ({
            nome: p.nome,
            usdPrice: p.ProdutoPrecoMoeda?.find((x: any) => String(x.currency).toLowerCase() === 'usd')?.amount ?? null
          }))
        }
      }
    }

    return { ok: true, categoria, produtos }

  } catch (error: any) {
    console.error('[intl/category] ERROR:', error?.message || error)
    if (error?.statusCode === 404) throw error
    return {
      ok: true,
      categoria: { id: slug, nome: mapSlugToName(slug), slug },
      produtos: [],
      _error: String(error?.message || 'Unknown error')
    }
  }
})
