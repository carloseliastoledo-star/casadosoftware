import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { createError, getRequestHeader, getRequestURL } from 'h3'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)
  const host = getRequestHeader(event, 'host')

  const id = String(event.context.params?.id || '')
  console.log('[ADMIN EDIT PRODUCT]', {
    id,
    storeSlug,
    host,
    url: getRequestURL(event).href
  })

  const produto = await (prisma as any).produto.findUnique({
    where: { id },
    include: {
      ProdutoPrecoLoja: {
        where: storeSlug ? { storeSlug } : undefined,
        select: { preco: true, precoAntigo: true }
      },
      ProdutoPrecoMoeda: {
        where: storeSlug ? { storeSlug } : undefined,
        select: { currency: true, amount: true, oldAmount: true }
      },
      ProdutoCategoria: {
        include: {
          Categoria: { select: { id: true, nome: true, slug: true } }
        }
      }
    }
  })

  console.log('[ADMIN EDIT PRODUCT] produto=', produto ? 'found' : 'not found')

  if (!produto) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Produto não encontrado'
    })
  }

  const categorias = ((produto as any).ProdutoCategoria || []).map((pc: any) => pc.Categoria || pc.categoria).filter(Boolean)
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
    precoUsd: (usd as any)?.amount ?? null,
    precoEur: (eur as any)?.amount ?? null,
    precosLoja: undefined
  }
})
