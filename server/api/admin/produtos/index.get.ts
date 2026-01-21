import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  return await prisma.produto.findMany({
    select: {
      id: true,
      nome: true,
      slug: true,
      preco: true
    },
    orderBy: { criadoEm: 'desc' }
  })
})
