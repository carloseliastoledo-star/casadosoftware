import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { createError, getRequestHeader } from 'h3'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)
  const id = (event.context.params as any)?.id

  const _host = getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'x-original-host') || getRequestHeader(event, 'host') || ''
  console.log('[produto/edit]', { id, storeSlug, host: _host, STORE_SLUG: process.env.STORE_SLUG, SITE_URL: process.env.SITE_URL })

  const produto = await (prisma as any).produto.findFirst({
    where: { id, ...(storeSlug ? { storeSlug } : {}) },
    include: {
      ProdutoPrecoLoja: {
        where: { storeSlug: storeSlug || undefined },
        select: { preco: true, precoAntigo: true }
      },
      ProdutoPrecoMoeda: {
        where: { storeSlug: storeSlug || undefined },
        select: { currency: true, amount: true, oldAmount: true }
      },
      ProdutoCategoria: {
        include: {
          Categoria: { select: { id: true, nome: true, slug: true } }
        }
      }
    }
  })

  if (!produto) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Produto não encontrado'
    })
  }

  const categorias = ((produto as any).ProdutoCategoria || []).map((pc: any) => pc.Categoria).filter(Boolean)
  const override = (produto as any).ProdutoPrecoLoja?.[0] || null

  const byCurrency = new Map(
    ((produto as any).ProdutoPrecoMoeda || [])
      .map((x: any) => ({
        currency: String(x.currency || '').trim().toLowerCase(),
        amount: x.amount == null ? null : Number(x.amount)
      }))
      .filter((x: any) => x.currency)
      .map((x: any) => [x.currency, x])
  )

  const usd = byCurrency.get('usd')
  const eur = byCurrency.get('eur')

  return {
    ...(produto as any),
    categorias,
    preco: override?.preco ?? (produto as any).preco,
    precoAntigo: override?.precoAntigo ?? (produto as any).precoAntigo,
    precoUsd: usd?.amount ?? null,
    precoEur: eur?.amount ?? null,
    precosLoja: undefined
  }
})
