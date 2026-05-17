import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const produtos = await (prisma as any).produto.findMany({
    where: { ativo: true, ProdutoPrecoMoeda: { some: { storeSlug: 'international' } } },
    select: {
      id: true,
      nome: true,
      slug: true,
      imagem: true,
      ProdutoPrecoMoeda: {
        select: { currency: true, amount: true }
      }
    },
    orderBy: { nome: 'asc' },
    take: 100
  })

  return {
    ok: true,
    count: produtos.length,
    produtos: produtos.map((p: any) => {
      const precos = p.ProdutoPrecoMoeda || []
      const usd = precos.find((x: any) => String(x.currency).toLowerCase() === 'usd')
      const eur = precos.find((x: any) => String(x.currency).toLowerCase() === 'eur')
      return {
        id: p.id,
        nome: p.nome,
        slug: p.slug,
        usd: usd ? Number(usd.amount) : null,
        eur: eur ? Number(eur.amount) : null
      }
    })
  }
})
