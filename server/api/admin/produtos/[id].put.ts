import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id
  const body = await readBody(event)

  return await prisma.produto.update({
    where: { id },
    data: {
      nome: body.nome,
      slug: body.slug,
      preco: Number(body.preco),
      descricao: body.descricao
    }
  })
})
