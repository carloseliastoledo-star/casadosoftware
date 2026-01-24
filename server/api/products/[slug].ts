import prisma from '#root/server/db/prisma'
import { getDefaultProductDescription } from '#root/server/utils/productDescriptionTemplate'

export default defineEventHandler(async (event) => {
  const rawSlug = event.context.params?.slug

  if (!rawSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug não informado'
    })
  }

  const slug = String(rawSlug)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')

  const product = await prisma.produto.findUnique({
    where: { slug }
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
    description,
    price: product.preco,
    image: product.imagem,
    tutorialTitle: product.tutorialTitulo,
    tutorialSubtitle: product.tutorialSubtitulo,
    tutorialContent: product.tutorialConteudo,
    createdAt: product.criadoEm
  }
})
