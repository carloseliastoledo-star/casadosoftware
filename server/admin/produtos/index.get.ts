import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  return await prisma.produto.findUnique({
    where: { id }
  })
})
