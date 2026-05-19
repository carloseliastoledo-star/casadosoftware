import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext, whereForStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const ctx = getStoreContext(event)

  // Get categories that are used by products of the current store
  const whereClause = ctx.storeSlug
    ? {
        ProdutoCategoria: {
          some: {
            Produto: whereForStore({ ativo: true }, ctx)
          }
        }
      }
    : {
        ProdutoCategoria: {
          some: {
            Produto: { ativo: true }
          }
        }
      }

  const categorias = await (prisma as any).Categoria.findMany({
    where: whereClause,
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
