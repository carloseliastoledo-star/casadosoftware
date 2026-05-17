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

    const produtoSelect = {
      id: true, nome: true, nomeEn: true, slug: true,
      imagem: true, cardItems: true, criadoEm: true,
      preco: true, precoAntigo: true,
      ProdutoPrecoLoja: {
        where: { storeSlug: resolvedStore },
        select: { preco: true, precoAntigo: true },
        take: 1
      }
    }

    // Buscar todos os produtos disponíveis para international (mesma lógica da home)
    const produtosRaw = await (prisma as any).produto.findMany({
      where: {
        ativo: true,
        ProdutoPrecoLoja: { some: { storeSlug: resolvedStore } }
      },
      select: produtoSelect
    })
    
    console.log('[intl/category] total intl products=', produtosRaw.length)

    // Filtrar por nome/categoria usando matchesCommercialSlug
    const produtosFiltrados = produtosRaw.filter((p: any) => matchesCommercialSlug(slug, p.nome))
    console.log('[intl/category] after JS filter=', produtosFiltrados.length)
    produtosRaw.length = 0
    produtosRaw.push(...produtosFiltrados)

    // 3. Buscar preços USD via ProdutoPrecoMoeda (override)
    const produtoIds = produtosRaw.map((p: any) => p.id)
    const usdPriceMap = new Map<string, { amount: number; oldAmount: number | null }>()
    if (produtoIds.length > 0) {
      try {
        const moedas = await (prisma as any).produtoPrecoMoeda.findMany({
          where: { produtoId: { in: produtoIds }, storeSlug: resolvedStore, currency: 'usd' },
          select: { produtoId: true, amount: true, oldAmount: true }
        })
        for (const m of moedas) {
          usdPriceMap.set(m.produtoId, { amount: Number(m.amount), oldAmount: m.oldAmount ? Number(m.oldAmount) : null })
        }
      } catch { /* sem override */ }
    }

    const produtos = produtosRaw.map((p: any) => {
      const usdOverride = usdPriceMap.get(p.id)
      const lojaPreco = p.ProdutoPrecoLoja?.[0]
      const usdPrice = usdOverride?.amount ?? Number(lojaPreco?.preco ?? p.preco ?? 0)
      const oldUsdPrice = usdOverride?.oldAmount ?? (lojaPreco?.precoAntigo ? Number(lojaPreco.precoAntigo) : (p.precoAntigo ? Number(p.precoAntigo) : null))
      return {
        id: p.id,
        name: p.nomeEn || p.nome,
        slug: p.slug,
        price: usdPrice,
        usdPrice,
        oldUsdPrice,
        eurPrice: null,
        precoAntigo: oldUsdPrice,
        currency: 'usd',
        storeSlug: resolvedStore,
        image: normalizeImageUrl(p.imagem),
        imagem: normalizeImageUrl(p.imagem),
        cardItems: p.cardItems,
        createdAt: p.criadoEm
      }
    })

    console.log('[intl/category] final products=', produtos.length)

    const categoria = {
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
