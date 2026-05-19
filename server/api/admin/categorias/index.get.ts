import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)

  // Get categories that are used by products of the current store
  const categorias = await (prisma as any).Categoria.findMany({
    where: storeSlug
      ? {
          ProdutoCategoria: {
            some: {
              Produto: {
                storeSlug: storeSlug
              }
            }
          }
        }
      : undefined,
    orderBy: { nome: 'asc' },
    select: {
      id: true,
      nome: true,
      slug: true,
      ativo: true
    }
  })

  return { ok: true, categorias }
})
