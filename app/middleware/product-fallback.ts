export default defineNuxtRouteMiddleware(async (to) => {
  const slug = String(to.params?.slug || '').trim()
  if (!slug) return navigateTo('/produtos', { replace: true })

  const config = useRuntimeConfig()
  const storeSlug = String((config.public as any)?.storeSlug || '').trim().toLowerCase()
  if (storeSlug === 'international') {
    return navigateTo({ path: '/checkout-intl', query: { product: slug } }, { replace: true, redirectCode: 302 })
  }

  try {
    const product: any = await $fetch(`/api/products/${encodeURIComponent(slug)}`, {
      method: 'GET'
    })

    if (!product || !(product?.id || product?.slug)) {
      return navigateTo('/produtos', { replace: true })
    }
  } catch {
    return navigateTo('/produtos', { replace: true })
  }
})
