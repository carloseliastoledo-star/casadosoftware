export default defineNuxtRouteMiddleware((to) => {
  // On client, window.location.host is always authoritative
  if (import.meta.client) {
    const clientHost = String(window.location.host || '').toLowerCase()
    const isIntlClient =
      !clientHost.endsWith('.com.br') &&
      !clientHost.includes('localhost') &&
      !clientHost.includes('127.0.0.1') &&
      clientHost.length > 0 &&
      (clientHost.includes('gvgmall') || clientHost.includes('globalsoftware') || clientHost.endsWith('.store'))

    if (!clientHost.startsWith('en.') && !clientHost.startsWith('es.') && !isIntlClient) return
  }

  const host = (() => {
    if (import.meta.server) {
      try {
        const headers = useRequestHeaders(['x-forwarded-host', 'x-original-host', 'host']) as Record<string, string | undefined>
        const raw = headers?.['x-forwarded-host'] || headers?.['x-original-host'] || headers.host || ''
        const first = String(raw || '').split(',')[0]?.trim()
        if (first) return String(first).toLowerCase()
      } catch {
        // ignore
      }
      try {
        const url = useRequestURL()
        if (url?.host) return String(url.host).toLowerCase()
      } catch {
        // ignore
      }
      return ''
    }
    return String(window.location.host || '').toLowerCase()
  })()

  const isEnHost = host.startsWith('en.')
  const isEsHost = host.startsWith('es.')

  // Runtime config storeSlug — set via NUXT_PUBLIC_STORE_SLUG env var
  const config = useRuntimeConfig()
  const storeSlugEnv = String((config.public as any)?.storeSlug || '').trim().toLowerCase()
  const isDefinitelyNotIntl = storeSlugEnv === 'casadosoftware' || storeSlugEnv === 'licencasdigitais'

  // On SSR: only treat as intl if explicitly known intl domains
  const isIntlDomain = import.meta.server
    ? !isDefinitelyNotIntl && (
        host.includes('gvgmall.co') ||
        host.includes('globalsoftware.store') ||
        host.endsWith('.store')
      )
    : !isDefinitelyNotIntl &&
      !host.endsWith('.com.br') &&
      !host.includes('localhost') &&
      !host.includes('127.0.0.1') &&
      host.length > 0 &&
      (host.includes('gvgmall') || host.includes('globalsoftware') || host.endsWith('.store'))

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
