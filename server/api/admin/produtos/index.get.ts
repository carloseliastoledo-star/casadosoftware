import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)

  const products = await (prisma as any).produto.findMany({
    select: {
      id: true,
      nome: true,
      slug: true,
      finalUrl: true,
      preco: true,
      precoAntigo: true,
      imagem: true,
      precosLoja: {
        where: { storeSlug: storeSlug || undefined },
        select: { preco: true, precoAntigo: true }
      },
      cardItems: true,
      ativo: true,
      criadoEm: true
    },
    orderBy: { criadoEm: 'desc' }
  })

  return products.map((p: any) => {
    const override = p?.precosLoja?.[0] || null
    return {
      ...p,
      preco: override?.preco ?? p.preco,
      precoAntigo: override?.precoAntigo ?? p.precoAntigo,
      precosLoja: undefined
    }
  })
})
