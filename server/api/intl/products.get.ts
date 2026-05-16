import { defineEventHandler, setHeader } from 'h3'
import prisma from '../../db/prisma'

const STORE_SLUG = 'international'

const INTL_PRODUCT_SLUGS = [
  'office-2021-pro-plus',
  'office-ltsc-pro-plus-2024',
  'microsoft-windows-11-pro-chave-esd-32-64-bits',
  'office-2021-pro-plus-windows-11-pro',
  'microsoft-windows-server-2022-standard-download-nota-fiscal',
]

const INTL_NAME_MAP: Record<string, string> = {
  'office-2021-pro-plus': 'Office 2021 Professional Plus',
  'office-ltsc-pro-plus-2024': 'Office 2024 Professional Plus',
  'microsoft-windows-11-pro-chave-esd-32-64-bits': 'Windows 11 Pro Digital License',
  'office-2021-pro-plus-windows-11-pro': 'Office 2021 Pro Plus + Windows 11 Pro',
  'microsoft-windows-server-2022-standard-download-nota-fiscal': 'Windows Server 2022 Standard',
}

function normalizeImageUrl(input: unknown): string | null {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  if (raw.startsWith('http://')) return raw.replace(/^http:\/\//, 'https://')
  if (raw.startsWith('https://') || raw.startsWith('/') || raw.startsWith('//')) return raw
  return raw
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')

  try {
    const produtos = await (prisma as any).produto.findMany({
      where: { slug: { in: INTL_PRODUCT_SLUGS }, ativo: true },
      select: { id: true, nome: true, nomeEn: true, slug: true, imagem: true, cardItems: true }
    })

    if (!produtos.length) return { ok: true, produtos: [] }

    const produtoIds = produtos.map((p: any) => p.id)

    const precos = await (prisma as any).produtoPrecoMoeda.findMany({
      where: { produtoId: { in: produtoIds }, storeSlug: STORE_SLUG, currency: 'usd' },
      select: { produtoId: true, amount: true, oldAmount: true }
    })

    const priceMap = new Map<string, { amount: number; oldAmount: number | null }>()
    for (const r of precos) {
      priceMap.set(r.produtoId, { amount: Number(r.amount), oldAmount: r.oldAmount ? Number(r.oldAmount) : null })
    }

    const resultado = produtos
      .filter((p: any) => priceMap.has(p.id))
      .map((p: any) => {
        const intlPrice = priceMap.get(p.id)!
        return {
          id: p.id,
          name: INTL_NAME_MAP[p.slug] || p.nomeEn || p.nome,
          slug: p.slug,
          usdPrice: intlPrice.amount,
          oldUsdPrice: intlPrice.oldAmount,
          currency: 'usd',
          storeSlug: STORE_SLUG,
          image: normalizeImageUrl(p.imagem),
          cardItems: p.cardItems,
        }
      })

    return { ok: true, produtos: resultado }
  } catch (error: any) {
    throw { statusCode: 503, statusMessage: `Error: ${error?.message || 'Unknown error'}` }
  }
})
