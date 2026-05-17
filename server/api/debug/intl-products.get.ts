import { defineEventHandler, setHeader } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-cache')

  const produtos = await (prisma as any).produto.findMany({
    where: { storeSlug: 'international', ativo: true },
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
    take: 200
  })

  const comPreco = produtos.filter((p: any) => {
    const precos = p.ProdutoPrecoMoeda || []
    const usd = precos.find((x: any) => String(x.currency).toLowerCase() === 'usd')
    return usd && Number(usd.amount) > 0
  })

  const windows = produtos.filter((p: any) => p.nome.toLowerCase().includes('windows'))
  const office = produtos.filter((p: any) => p.nome.toLowerCase().includes('office'))
  const games = produtos.filter((p: any) => p.nome.toLowerCase().includes('game'))

  return {
    ok: true,
    total: produtos.length,
    comPrecoUsd: comPreco.length,
    windowsCount: windows.length,
    officeCount: office.length,
    gamesCount: games.length,
    samples: produtos.slice(0, 10).map((p: any) => {
      const precos = p.ProdutoPrecoMoeda || []
      const usd = precos.find((x: any) => String(x.currency).toLowerCase() === 'usd')
      return {
        nome: p.nome,
        slug: p.slug,
        usd: usd ? Number(usd.amount) : null
      }
    })
  }
})
