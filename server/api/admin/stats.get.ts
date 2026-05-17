import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'
import { getStoreContext, whereForStore } from '../../utils/store'

export default defineEventHandler(async (event) => {
  const ctx = getStoreContext(event)
  const produtoWhere = ctx.storeSlug
    ? { ProdutoPrecoLoja: { some: { storeSlug: ctx.storeSlug } } }
    : {}
  const [produtosTotal, licencasTotal, ultimosProdutos] = await Promise.all([
    prisma.produto.count({ where: produtoWhere as any }),
    prisma.licenca.count({ where: whereForStore({}, ctx) as any }),
    prisma.produto.findMany({
      where: produtoWhere as any,
      orderBy: { criadoEm: 'desc' },
      take: 5,
      select: {
        id: true,
        nome: true,
        slug: true,
        preco: true,
        criadoEm: true
      }
    })
  ])

  return {
    produtosTotal,
    licencasTotal,
    ultimosProdutos
  }
})
