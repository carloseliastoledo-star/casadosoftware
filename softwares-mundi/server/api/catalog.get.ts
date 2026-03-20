import { categories, products } from '~/data/catalog'
import { readProductOverrides } from '~~/server/utils/productOverrides'

export default defineEventHandler(async () => {
  const overrides = await readProductOverrides()

  const mergedProducts = products.map((p) => {
    const o = overrides[p.slug] || {}
    return { ...p, ...o }
  })

  return {
    categories,
    products: mergedProducts
  }
})
