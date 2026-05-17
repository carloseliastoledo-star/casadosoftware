import { defineEventHandler, getQuery } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const q = getQuery(event)
  const slug = String(q.slug || '').trim().toLowerCase()

  const intlFilter = { ativo: true, ProdutoPrecoLoja: { some: { storeSlug: 'international' } } }

  const totalProdutos = await (prisma as any).produto.count({
    where: intlFilter
  })

  const windowsProdutos = await (prisma as any).produto.count({
    where: { ...intlFilter, nome: { contains: 'Windows' } }
  })

  const officeProdutos = await (prisma as any).produto.count({
    where: {
      ...intlFilter,
      OR: [
        { nome: { contains: 'Office' } },
        { nome: { contains: '365' } }
      ]
    }
  })

  const sample = await (prisma as any).produto.findMany({
    where: intlFilter,
    take: 5,
    select: { id: true, nome: true, slug: true }
  })

  return {
    ok: true,
    slug: slug || 'none',
    totalProdutos,
    windowsProdutos,
    officeProdutos,
    sampleProducts: sample
  }
})
