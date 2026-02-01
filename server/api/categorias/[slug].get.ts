import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '../../db/prisma'
import { getStoreContext } from '#root/server/utils/store'
import { getIntlContext } from '#root/server/utils/intl'
import { resolveEffectivePrice } from '#root/server/utils/productCurrencyPricing'

function normalizeImageUrl(input: unknown): string | null {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  if (raw.startsWith('http://')) return raw.replace(/^http:\/\//, 'https://')
  if (raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`
  return raw
}

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim()
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug obrigatório' })
  }

  const { storeSlug } = getStoreContext()

  const intl = getIntlContext(event)

  const categoria = await (prisma as any).categoria.findUnique({
    where: { slug },
    select: {
      id: true,
      nome: true,
      slug: true,
      ativo: true,
      produtoCategorias: {
        where: {
          produto: { ativo: true }
        },
        select: {
          produto: {
            select: {
              id: true,
              nome: true,
              slug: true,
              descricao: true,
              preco: true,
              precoAntigo: true,
              imagem: true,
              precosLoja: {
                where: { storeSlug: storeSlug || undefined },
                select: { preco: true, precoAntigo: true }
              },
              precosMoeda: {
                where: { storeSlug: storeSlug || undefined },
                select: { currency: true, amount: true, oldAmount: true }
              },
              criadoEm: true
            }
          }
        }
      }
    }
  })

  if (!categoria) {
    throw createError({ statusCode: 404, statusMessage: 'Categoria não encontrada' })
  }

  if (!(categoria as any).ativo) {
    throw createError({ statusCode: 404, statusMessage: 'Categoria não encontrada' })
  }

  type ProdutoItem = {
    id: string
    nome: string
    slug: string
    descricao: string | null
    preco: number
    precoAntigo: number | null
    imagem: string | null
    precosLoja?: Array<{ preco: number; precoAntigo: number | null }>
    criadoEm: Date
  }

  return {
    ok: true,
    categoria: {
      id: categoria.id,
      nome: categoria.nome,
      slug: categoria.slug
    },
    produtos: ((categoria as any).produtoCategorias || [])
      .map((pc: { produto: ProdutoItem }) => pc.produto)
      .filter((p: ProdutoItem | null): p is ProdutoItem => Boolean(p))
      .sort((a: ProdutoItem, b: ProdutoItem) => Number(new Date(b.criadoEm)) - Number(new Date(a.criadoEm)))
      .map((p: ProdutoItem) => {
        const override = (p as any).precosLoja?.[0] || null

        const effective = resolveEffectivePrice({
          requestedCurrency: intl.currency,
          baseAmount: p.preco,
          baseOldAmount: p.precoAntigo,
          storeAmountOverride: override?.preco,
          storeOldAmountOverride: override?.precoAntigo,
          currencyRows: (p as any).precosMoeda || []
        })

        const effectivePrice = effective.amount
        const effectiveOldPrice = effective.oldAmount

        return {
          id: p.id,
          name: p.nome,
          slug: p.slug,
          description: p.descricao,
          price: effectivePrice,
          precoAntigo: effectiveOldPrice,
          currency: effective.currency,
          image: normalizeImageUrl(p.imagem),
          createdAt: p.criadoEm
        }
      })
  }
})
