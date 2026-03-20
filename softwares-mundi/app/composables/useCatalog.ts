import type { Category, Product } from '~/data/catalog'

export function useCatalog() {
  const { data, pending, error, refresh } = useFetch<{ categories: Category[]; products: Product[] }>('/api/catalog')

  const categories = computed(() => data.value?.categories || [])
  const products = computed(() => data.value?.products || [])

  function getProduct(slug: string) {
    const s = String(slug || '').trim()
    return products.value.find((p) => p.slug === s) || null
  }

  function getCategory(slug: string) {
    const s = String(slug || '').trim()
    return categories.value.find((c) => c.slug === s) || null
  }

  function getProductsByCategory(slug: string) {
    const s = String(slug || '').trim()
    return products.value.filter((p) => p.categorySlug === s)
  }

  return { data, pending, error, refresh, categories, products, getProduct, getCategory, getProductsByCategory }
}
