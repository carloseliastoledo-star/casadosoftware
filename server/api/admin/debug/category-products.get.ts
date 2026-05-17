import { defineEventHandler, getQuery } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const q = getQuery(event)
  const slug = String(q.slug || '').trim().toLowerCase()

  const intlFilter = { ativo: true, ProdutoPrecoMoeda: { some: { storeSlug: 'international' } } }

  const totalProdutos = await (prisma as any).produto.count({ where: intlFilter })

  const allProdutos = await (prisma as any).produto.findMany({
    where: intlFilter,
    select: {
      id: true, nome: true, nomeEn: true, slug: true,
      ProdutoPrecoMoeda: {
        where: { storeSlug: 'international' },
        select: { currency: true, amount: true }
      }
    },
    orderBy: { nome: 'asc' },
    take: 100
  })

  return {
    ok: true,
    slug: slug || 'none',
    totalProdutos,
    produtos: allProdutos.map((p: any) => ({
      nome: p.nome,
      nomeEn: p.nomeEn || null,
      slug: p.slug,
      precos: p.ProdutoPrecoMoeda
    }))
  }
})
