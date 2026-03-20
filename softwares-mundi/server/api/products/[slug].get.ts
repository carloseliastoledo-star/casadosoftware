import { getProductBySlug } from '~/data/catalog'
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { readProductOverrides } from '~~/server/utils/productOverrides'

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim()
  const product = getProductBySlug(slug)
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const overrides = await readProductOverrides()
  const o = overrides[product.slug] || {}
  return { ...product, ...o }
})
