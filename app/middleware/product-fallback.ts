export default defineNuxtRouteMiddleware(async (to) => {
  const slug = String(to.params?.slug || '').trim()
  if (!slug) return navigateTo('/produtos', { replace: true })

  const config = useRuntimeConfig()
  const storeSlug = String((config.public as any)?.storeSlug || '').trim().toLowerCase()

  const _host = (() => {
    if (import.meta.server) {
      try {
        const headers = useRequestHeaders(['x-forwarded-host', 'host']) as Record<string, string | undefined>
        const raw = headers?.['x-forwarded-host'] || headers?.host || ''
        return String(raw).split(',')[0]?.trim()?.toLowerCase() || ''
      } catch { return '' }
    }
    try { return String(window.location.host || '').toLowerCase() } catch { return '' }
  })()

  const isIntl = storeSlug === 'international' ||
    _host.includes('globalsoftware.store') ||
    (_host.includes('globalsoftware-prev') && _host.includes('vercel.app'))

  if (isIntl) {
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
