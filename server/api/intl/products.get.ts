import { defineEventHandler, setHeader } from 'h3'
import prisma from '../../db/prisma'

const STORE_SLUG = 'international'

function normalizeImageUrl(input: unknown): string | null {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  if (raw.startsWith('http://')) return raw.replace(/^http:\/\//, 'https://')
  if (raw.startsWith('https://') || raw.startsWith('/') || raw.startsWith('//')) return raw
  return raw
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')

  try {
    // 1. Buscar preços internacionais via ProdutoPrecoLoja (salvo pelo importador CSV)
    const precoLoja = await (prisma as any).produtoPrecoLoja.findMany({
      where: { storeSlug: STORE_SLUG },
      select: {
        produtoId: true,
        preco: true,
        precoAntigo: true,
        Produto: {
          select: { id: true, nome: true, nomeEn: true, slug: true, imagem: true, cardItems: true, ativo: true }
        }
      }
    })

    // 2. Filtrar apenas produtos ativos
    const ativos = precoLoja.filter((r: any) => r.Produto?.ativo)

    if (!ativos.length) return { ok: true, produtos: [] }

    // 3. Tentar buscar preços USD via ProdutoPrecoMoeda (opcional, para override)
    const produtoIds = ativos.map((r: any) => r.produtoId)
    const usdPriceMap = new Map<string, { amount: number; oldAmount: number | null }>()
    try {
      const moedas = await (prisma as any).produtoPrecoMoeda.findMany({
        where: { produtoId: { in: produtoIds }, storeSlug: STORE_SLUG, currency: 'usd' },
        select: { produtoId: true, amount: true, oldAmount: true }
      })
      for (const m of moedas) {
        usdPriceMap.set(m.produtoId, { amount: Number(m.amount), oldAmount: m.oldAmount ? Number(m.oldAmount) : null })
      }
    } catch {
      // fallback: usar preco de ProdutoPrecoLoja
    }

    // 4. Montar resposta
    const resultado = ativos.map((r: any) => {
      const p = r.Produto
      const usd = usdPriceMap.get(r.produtoId)
      const usdPrice = usd?.amount ?? Number(r.preco)
      const oldUsdPrice = usd?.oldAmount ?? (r.precoAntigo ? Number(r.precoAntigo) : null)

      return {
        id: p.id,
        name: p.nomeEn || p.nome,
        slug: p.slug,
        usdPrice,
        oldUsdPrice,
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
