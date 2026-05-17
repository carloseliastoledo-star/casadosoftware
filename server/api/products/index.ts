import prisma from '#root/server/db/prisma'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  const { storeSlug } = getStoreContext(event)

  const storeFilter = storeSlug
    ? { ProdutoPrecoLoja: { some: { storeSlug } } }
    : {}

  const products = await prisma.produto.findMany({
    where: {
      ativo: true,
      ...storeFilter
    },
    orderBy: {
      criadoEm: 'desc'
    }
  })

  return products
})
