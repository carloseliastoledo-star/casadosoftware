import { defineEventHandler, getRouterParam, createError, setHeader } from 'h3'
import prisma from '../../../db/prisma'

const STORE_SLUG = 'international'

// Hardcoded category metadata for fallback
const INTL_CATEGORIES: Record<string, { name: string; productSlugs: string[] }> = {
  'windows': {
    name: 'Windows',
    productSlugs: [
      'microsoft-windows-11-pro-chave-esd-32-64-bits',
      'microsoft-windows-10-pro-chave-esd-32-64-bits',
      'office-2021-pro-plus-windows-11-pro',
      'winserver2025',
    ]
  },
  'office': {
    name: 'Office',
    productSlugs: [
      'microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive',
      'office-365',
      'office-ltsc-pro-plus-2024',
      'office-2021-pro-plus-windows-11-pro',
    ]
  },
  'windows-server': {
    name: 'Windows Server',
    productSlugs: [
      'winserver2025',
    ]
  },
}

// USD prices per slug (same as products.get.ts)
const INTL_USD_PRICES: Record<string, { nameEn: string; usdPrice: number; oldUsdPrice?: number }> = {
  'microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive': { nameEn: 'Microsoft 365 – 5 Devices, 1TB OneDrive', usdPrice: 29.99, oldUsdPrice: 49.99 },
  'office-365': { nameEn: 'Office 365 Original License – Instant Delivery', usdPrice: 19.99, oldUsdPrice: 34.99 },
  'microsoft-windows-11-pro-chave-esd-32-64-bits': { nameEn: 'Windows 11 Pro – Digital License ESD', usdPrice: 14.99, oldUsdPrice: 29.99 },
  'microsoft-windows-10-pro-chave-esd-32-64-bits': { nameEn: 'Windows 10 Pro – Digital License ESD', usdPrice: 12.99, oldUsdPrice: 24.99 },
  'office-2021-pro-plus-windows-11-pro': { nameEn: 'Office 2021 Pro Plus + Windows 11 Pro Bundle', usdPrice: 24.99, oldUsdPrice: 44.99 },
  'office-ltsc-pro-plus-2024': { nameEn: 'Office 2024 Professional Plus', usdPrice: 34.99, oldUsdPrice: 59.99 },
  'winserver2025': { nameEn: 'Windows Server 2025 Standard', usdPrice: 39.99, oldUsdPrice: 69.99 },
}

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

  const slug = String(getRouterParam(event, 'slug') || '').trim().toLowerCase()
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })

  const catConfig = INTL_CATEGORIES[slug]
  if (!catConfig) throw createError({ statusCode: 404, statusMessage: 'Category not found' })

  try {
    // Fetch product data from DB for the slugs in this category
    const produtos = await (prisma as any).produto.findMany({
      where: { slug: { in: catConfig.productSlugs }, ativo: true },
      select: { id: true, nome: true, nomeEn: true, slug: true, imagem: true, cardItems: true, criadoEm: true }
    })

    // Try DB prices first, fall back to hardcoded
    let dbPriceMap = new Map<string, { amount: number; oldAmount: number | null }>()
    try {
      const produtoIds = produtos.map((p: any) => p.id)
      const precosIntl = await (prisma as any).produtoPrecoMoeda.findMany({
        where: { produtoId: { in: produtoIds }, storeSlug: STORE_SLUG, currency: 'usd' },
        select: { produtoId: true, amount: true, oldAmount: true }
      })
      for (const r of precosIntl) {
        dbPriceMap.set(r.produtoId, { amount: Number(r.amount), oldAmount: r.oldAmount ? Number(r.oldAmount) : null })
      }
    } catch { /* use hardcoded */ }

    const produtosMapeados = produtos.map((p: any) => {
      const cfg = INTL_USD_PRICES[p.slug as string]
      const dbPrice = dbPriceMap.get(p.id)
      const usdPrice = dbPrice?.amount ?? cfg?.usdPrice ?? null
      const oldUsdPrice = dbPrice?.oldAmount ?? cfg?.oldUsdPrice ?? null
      if (!usdPrice) return null
      return {
        id: p.id,
        name: cfg?.nameEn || p.nomeEn || p.nome,
        slug: p.slug,
        price: usdPrice,
        precoAntigo: oldUsdPrice,
        currency: 'usd',
        storeSlug: STORE_SLUG,
        image: normalizeImageUrl(p.imagem),
        cardItems: p.cardItems,
        createdAt: p.criadoEm
      }
    }).filter(Boolean)

    return {
      ok: true,
      categoria: { id: slug, nome: catConfig.name, slug },
      produtos: produtosMapeados
    }

  } catch (error: any) {
    if (error?.statusCode === 404) throw error
    throw createError({ statusCode: 503, statusMessage: `Error: ${error?.message || 'Unknown error'}` })
  }
})
