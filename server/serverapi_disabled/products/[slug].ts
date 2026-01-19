import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async (event) => {
  const raw = getRouterParam(event, 'slug')

  if (!raw) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug não informado',
    })
  }

  const slug = raw.toLowerCase().trim()

  try {
    console.log('🔎 Buscando produto:', slug)

    const product = await prisma.produto.findUnique({
      where: { slug },
      include: {
        licencas: true,
      },
    })

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Produto não encontrado',
      })
    }

    return product
  } catch (error) {
    console.error('❌ ERRO API /products/[slug]:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno ao buscar produto',
    })
  }
})
