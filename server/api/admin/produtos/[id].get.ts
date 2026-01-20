import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  const produto = await prisma.produto.findUnique({
    where: { id }
  })

  if (!produto) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Produto não encontrado'
    })
  }

  return produto
})
