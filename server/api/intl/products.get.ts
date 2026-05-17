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
    // 1. Buscar produtos que têm ProdutoPrecoLoja para a loja internacional
    //    (não filtra por storeSlug no Produto pois o campo pode não existir no banco)
    const produtos = await (prisma as any).produto.findMany({
      where: {
        ativo: true,
        ProdutoPrecoLoja: { some: { storeSlug: STORE_SLUG } }
      },
      select: {
        id: true,
        nome: true,
        nomeEn: true,
        slug: true,
        slugEn: true,
        imagem: true,
        cardItems: true,
        preco: true,
        precoAntigo: true,
        ProdutoPrecoLoja: {
          where: { storeSlug: STORE_SLUG },
          select: { preco: true, precoAntigo: true },
          take: 1
        }
      },
      orderBy: { criadoEm: 'desc' }
    })

    if (!produtos.length) return { ok: true, produtos: [] }

    // 2. Tentar buscar preços USD via ProdutoPrecoMoeda (opcional, para override)
    const produtoIds = produtos.map((p: any) => p.id)
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
      // sem override USD — usa preco base
    }

    // 3. Montar resposta — prioridade: ProdutoPrecoMoeda > ProdutoPrecoLoja > Produto.preco
    const resultado = produtos.map((p: any) => {
      const usd = usdPriceMap.get(p.id)
      const lojaPreco = p.ProdutoPrecoLoja?.[0]
      const usdPrice = usd?.amount ?? Number(lojaPreco?.preco ?? p.preco)
      const oldUsdPrice = usd?.oldAmount ?? (lojaPreco?.precoAntigo ? Number(lojaPreco.precoAntigo) : (p.precoAntigo ? Number(p.precoAntigo) : null))

      return {
        id: p.id,
        name: p.nomeEn || p.nome,
        slug: p.slug,
        slugEn: p.slugEn,
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
