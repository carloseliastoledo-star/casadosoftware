import prisma from '#root/server/db/prisma'
import { getDefaultProductDescription } from '#root/server/utils/productDescriptionTemplate'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug

  const product = await prisma.produto.findUnique({
    where: { slug: String(slug) }
  })

  if (!product || !product.ativo) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Produto não encontrado'
    })
  }

  const rawDescription = typeof product.descricao === 'string' ? product.descricao.trim() : ''
  const description = rawDescription
    ? rawDescription
    : getDefaultProductDescription({ nome: product.nome, slug: product.slug })

  return {
    id: product.id,
    name: product.nome,
    slug: product.slug,
    finalUrl: product.finalUrl,
    description,
    price: product.preco,
    image: product.imagem,   // 👈 CAMPO CRÍTICO
    tutorialTitle: product.tutorialTitulo,
    tutorialSubtitle: product.tutorialSubtitulo,
    tutorialContent: product.tutorialConteudo,
    createdAt: product.criadoEm
  }
})
