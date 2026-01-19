import prisma from '../../../db/prisma'

export default defineEventHandler(async () => {
  return await prisma.produto.findMany({
    orderBy: { criadoEm: 'desc' }
  })
})
