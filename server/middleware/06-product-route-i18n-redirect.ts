import { defineEventHandler, getRequestHeader, sendRedirect, type H3Event } from 'h3'

function splitPathAndQuery(url: string): { path: string; query: string } {
  const idx = url.indexOf('?')
  if (idx === -1) return { path: url, query: '' }
  return { path: url.slice(0, idx), query: url.slice(idx + 1) }
}

function detectHost(event: H3Event): string {
  const raw = String(getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host') || '').trim()
  const first = raw.split(',')[0]?.trim() || ''
  return first.toLowerCase()
}

export default defineEventHandler((event: H3Event) => {
  const rawUrl = event.node.req.url || ''
  const { path, query } = splitPathAndQuery(rawUrl)

  if (!path) return
  if (path.startsWith('/api/')) return
  if (path.startsWith('/_nuxt/')) return
  if (path.startsWith('/admin')) return

  const normalized = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path

  const host = detectHost(event)
  const isEnHost = host.startsWith('en.')
  const isEsHost = host.startsWith('es.')

  if (!isEnHost && !isEsHost) return

  const m = normalized.match(/^\/produto\/([^/]+)$/i)
  if (!m) return

  const slug = m[1]
  const targetPath = isEnHost ? `/product/${slug}` : `/producto/${slug}`
  const location = query ? `${targetPath}?${query}` : targetPath
  return sendRedirect(event, location, 301)
}
