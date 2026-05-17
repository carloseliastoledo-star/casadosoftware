import { defineEventHandler, getQuery } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const q = getQuery(event)
  const slug = String(q.slug || '').trim().toLowerCase()

  const totalProdutos = await (prisma as any).produto.count({
    where: { storeSlug: 'international', ativo: true }
  })

  const windowsProdutos = await (prisma as any).produto.count({
    where: {
      storeSlug: 'international',
      ativo: true,
      nome: { contains: 'Windows' }
    }
  })

  const officeProdutos = await (prisma as any).produto.count({
    where: {
      storeSlug: 'international',
      ativo: true,
      OR: [
        { nome: { contains: 'Office' } },
        { nome: { contains: '365' } }
      ]
    }
  })

  const sample = await (prisma as any).produto.findMany({
    where: { storeSlug: 'international', ativo: true },
    take: 5,
    select: { id: true, nome: true, slug: true }
  })

  return {
    ok: true,
    slug: slug || 'none',
    totalProdutos,
    windowsProdutos,
    officeProdutos,
    sampleProducts: sample
  }
})
