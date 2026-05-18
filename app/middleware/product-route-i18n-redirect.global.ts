export default defineNuxtRouteMiddleware((to) => {
  // ── Fast exit: resolve host immediately and skip if not an intl/en/es domain ──
  const quickHost = (() => {
    if (import.meta.client) return String(window.location.host || '').toLowerCase()
    try {
      const headers = useRequestHeaders(['x-forwarded-host', 'host']) as Record<string, string | undefined>
      const raw = headers?.['x-forwarded-host'] || headers?.host || ''
      return String(raw.split(',')[0]?.trim() || '').toLowerCase()
    } catch { return '' }
  })()

  const config = useRuntimeConfig()
  const storeSlugEnv = String((config.public as any)?.storeSlug || '').trim().toLowerCase()

  // If storeSlug is explicitly casadosoftware or licencasdigitais, never redirect
  if (storeSlugEnv === 'casadosoftware' || storeSlugEnv === 'licencasdigitais') return

  // If host is .com.br or localhost, never redirect
  if (quickHost.endsWith('.com.br') || quickHost.includes('localhost') || quickHost.includes('127.0.0.1')) return

  // Only proceed for known intl domains or en./es. subdomains
  const isKnownIntl = quickHost.includes('gvgmall') || quickHost.includes('globalsoftware') || quickHost.endsWith('.store')
  const isEnSub = quickHost.startsWith('en.')
  const isEsSub = quickHost.startsWith('es.')
  if (!isKnownIntl && !isEnSub && !isEsSub) return

  const isEnHost = quickHost.startsWith('en.')
  const isEsHost = quickHost.startsWith('es.')
  const isIntlDomain = isKnownIntl

  if (!isEnHost && !isEsHost && !isIntlDomain) return

  const path = String(to.path || '')
  const normalized = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path

  // International domain redirects
  if (isIntlDomain) {
    // Direct redirects
    const intlDirectMap: Record<string, string> = {
      '/produtos': '/products',
      '/categorias': '/categories',
      '/quem-somos': '/about-us',
      '/entrega-digital': '/digital-delivery',
      '/reembolso': '/refund-policy',
      '/privacidade': '/privacy-policy',
      '/termos': '/terms-of-use'
    }

    const mappedIntlDirect = intlDirectMap[normalized]
    if (mappedIntlDirect) {
      return navigateTo({ path: mappedIntlDirect, query: to.query, hash: to.hash }, { redirectCode: 301, replace: true })
    }

    // Product redirect: /produto/[slug] -> /product/[slugEn or slug]
    const productMatch = normalized.match(/^\/produto\/([^/]+)$/i)
    if (productMatch) {
      const slug = productMatch[1]
      return navigateTo({ path: `/product/${slug}`, query: to.query, hash: to.hash }, { redirectCode: 301, replace: true })
    }

    // Category redirect: /categoria/[slug] -> /category/[slug]
    const categoryMatch = normalized.match(/^\/categoria\/([^/]+)$/i)
    if (categoryMatch) {
      const slug = categoryMatch[1]
      return navigateTo({ path: `/category/${slug}`, query: to.query, hash: to.hash }, { redirectCode: 301, replace: true })
    }

    return
  }

  // Subdomain redirects (existing logic)
  const directMap: Record<string, string> = isEnHost
    ? {
        '/produtos': '/products',
        '/categorias': '/categories',
        '/quem-somos': '/about-us',
        '/entrega-digital': '/digital-delivery',
        '/reembolso': '/refund-policy',
        '/privacidade': '/privacy-policy',
        '/termos': '/terms-of-use'
      }
    : {
        '/produto': '/producto'
      }

  const mappedDirect = directMap[normalized]
  if (mappedDirect) {
    return navigateTo({ path: mappedDirect, query: to.query, hash: to.hash }, { replace: true })
  }

  const productMatch = normalized.match(/^\/produto\/([^/]+)$/i)
  if (productMatch) {
    const slug = productMatch[1]
    const targetPath = isEnHost ? `/product/${slug}` : `/producto/${slug}`
    return navigateTo({ path: targetPath, query: to.query, hash: to.hash }, { replace: true })
  }

  const categoryMatch = normalized.match(/^\/categoria\/([^/]+)$/i)
  if (categoryMatch && isEnHost) {
    const slug = categoryMatch[1]
    return navigateTo({ path: `/category/${slug}`, query: to.query, hash: to.hash }, { replace: true })
  }
})
