import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)

  const categorias = await (prisma as any).categoria.findMany({
    where: storeSlug ? { storeSlug } : undefined,
    orderBy: { nome: 'asc' },
    select: {
      id: true,
      storeSlug: true,
      nome: true,
      slug: true,
      ativo: true
    }
  })

  return { ok: true, categorias }
})
