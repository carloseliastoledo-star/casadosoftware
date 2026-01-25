import prisma from '#root/server/db/prisma'
import { getDefaultProductDescription } from '#root/server/utils/productDescriptionTemplate'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug

  const product = await prisma.produto.findUnique({
    where: { slug: String(slug) },
    include: {
      produtoCategorias: { select: { categoria: { select: { slug: true } } } }
    }
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
    categories: (product.produtoCategorias || []).map((pc) => pc.categoria?.slug).filter(Boolean),
    tutorialTitle: product.tutorialTitulo,
    tutorialSubtitle: product.tutorialSubtitulo,
    tutorialContent: product.tutorialConteudo,
    createdAt: product.criadoEm
  }
})
