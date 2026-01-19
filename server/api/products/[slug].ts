import prisma from '#root/server/db/prisma'

export default defineEventHandler(async (event) => {
  const rawSlug = event.context.params?.slug

  if (!rawSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug não informado'
    })
  }

  const slug = rawSlug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')

  const product = await prisma.Produto.findUnique({
    where: { slug }
  })

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Produto não encontrado'
    })
  }

  return product
})
