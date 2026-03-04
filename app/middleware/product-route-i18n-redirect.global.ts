export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return

  const host = String(window.location.host || '').toLowerCase()
  const isEnHost = host.startsWith('en.')
  const isEsHost = host.startsWith('es.')
  if (!isEnHost && !isEsHost) return

  const path = String(to.path || '')
  const normalized = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path

  const m = normalized.match(/^\/produto\/([^/]+)$/i)
  if (!m) return

  const slug = m[1]
  const targetPath = isEnHost ? `/product/${slug}` : `/producto/${slug}`

  return navigateTo(
    {
      path: targetPath,
      query: to.query,
      hash: to.hash
    },
    { replace: true }
  )
})
