import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return await prisma.produto.create({
    data: {
      nome: body.nome,
      slug: body.slug,
      preco: Number(body.preco),
      descricao: body.descricao,
      imagem: body.imagem
    }
  })
})
