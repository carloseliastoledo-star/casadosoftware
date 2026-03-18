export default defineNuxtRouteMiddleware((to) => {
  const host = (() => {
    if (import.meta.server) {
      try {
        const url = useRequestURL()
        if (url?.host) return String(url.host).toLowerCase()
      } catch {
        // ignore
      }

      try {
        const headers = useRequestHeaders(['x-forwarded-host', 'x-original-host', 'host']) as Record<string, string | undefined>
        const raw = headers?.['x-forwarded-host'] || headers?.['x-original-host'] || headers?.host || ''
        const first = String(raw || '').split(',')[0]?.trim()
        return String(first || '').toLowerCase()
      } catch {
        return ''
      }
    }

    return String(window.location.host || '').toLowerCase()
  })()

  const isEnHost = host.startsWith('en.')
  const isEsHost = host.startsWith('es.')
  if (!isEnHost && !isEsHost) return

  const path = String(to.path || '')
  const normalized = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path

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
