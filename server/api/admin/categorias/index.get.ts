import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'

const COMMERCIAL_SLUGS = [
  'windows',
  'office',
  'windows-server',
  'adobe',
  'autodesk',
  'games',
  'electronics'
]

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)

  const where: any = storeSlug ? { storeSlug } : undefined

  // Na loja internacional, mostrar apenas categorias comerciais amigáveis
  if (storeSlug === 'international') {
    where.slug = { in: COMMERCIAL_SLUGS }
  }

  const categorias = await (prisma as any).categoria.findMany({
    where,
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
