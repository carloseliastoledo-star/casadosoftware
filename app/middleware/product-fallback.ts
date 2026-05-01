export default defineNuxtRouteMiddleware(async (to) => {
  const slug = String(to.params?.slug || '').trim()
  if (!slug) return navigateTo('/produtos', { replace: true })

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
