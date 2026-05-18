export default defineNuxtRouteMiddleware(async (to) => {
  const slug = String(to.params?.slug || '').trim()
  if (!slug) return navigateTo('/produtos', { replace: true })

  try {
    const requestFetch = useRequestFetch()
    const product: any = await requestFetch(`/api/products/${encodeURIComponent(slug)}`)

    if (!product || !(product?.id || product?.slug)) {
      return navigateTo('/produtos', { replace: true })
    }
  } catch {
    return navigateTo('/produtos', { replace: true })
  }
})
