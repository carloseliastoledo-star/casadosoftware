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
        nome: { contains: 'Windows' },
        NOT: { nome: { contains: 'Server' } }
      }
    case 'windows-server':
      return {
        ...base,
        nome: { contains: 'Windows Server' }
      }
    case 'office':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Office' } },
          { nome: { contains: 'Microsoft 365' } },
          { nome: { contains: '365' } }
        ]
      }
    case 'adobe':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Adobe' } },
          { nome: { contains: 'Photoshop' } },
          { nome: { contains: 'Illustrator' } },
          { nome: { contains: 'Creative Cloud' } },
          { nome: { contains: 'Acrobat' } }
        ]
      }
    case 'autodesk':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Autodesk' } },
          { nome: { contains: 'AutoCAD' } },
          { nome: { contains: '3DS Max' } },
          { nome: { contains: 'SketchUp' } }
        ]
      }
    case 'games':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Steam' } },
          { nome: { contains: 'Xbox' } },
          { nome: { contains: 'PSN' } },
          { nome: { contains: 'EA SPORTS' } },
          { nome: { contains: 'Battlefield' } },
          { nome: { contains: 'ARC Raiders' } },
          { nome: { contains: 'Game' } }
        ]
      }
    case 'electronics':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Keyboard' } },
          { nome: { contains: 'Router' } },
          { nome: { contains: 'Mouse' } },
          { nome: { contains: 'Monitor' } },
          { nome: { contains: 'Headset' } },
          { nome: { contains: 'Webcam' } },
          { nome: { contains: 'Electronics' } }
        ]
      }
    default:
      return null
  }
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')

  const { storeSlug } = getStoreContext(event)
  const resolvedStore = storeSlug || 'international'

  const slug = String(getRouterParam(event, 'slug') || '').trim().toLowerCase()
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })

  try {
    // 1. Tentar como categoria técnica (slug real no banco)
    const categoriaDb = await (prisma as any).categoria.findFirst({
      where: { slug, storeSlug: resolvedStore, ativo: true },
      select: { id: true, nome: true, slug: true }
    })

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
      // Fallback: se nenhum produto vinculado, tentar buscar por nome
      if (produtosRaw.length === 0) {
        const commercialWhere = buildCommercialWhere(slug)
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
        }
      }
    } else {
      // 2. Tentar como categoria comercial (filtro por nome)
      const commercialWhere = buildCommercialWhere(slug)
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
