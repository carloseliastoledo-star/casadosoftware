import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'
import { getStoreContext, whereForStore } from '../../utils/store'

export default defineEventHandler(async (event) => {
  const ctx = getStoreContext(event)
  const [produtosTotal, licencasTotal, ultimosProdutos] = await Promise.all([
    prisma.produto.count(),
    prisma.licenca.count({ where: whereForStore({}, ctx) as any }),
    prisma.produto.findMany({
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
