import { defineEventHandler, sendRedirect, type H3Event } from 'h3'

function splitPathAndQuery(url: string): { path: string; query: string } {
  const idx = url.indexOf('?')
  if (idx === -1) return { path: url, query: '' }
  return { path: url.slice(0, idx), query: url.slice(idx + 1) }
}

export default defineEventHandler((event: H3Event) => {
  const rawUrl = event.node.req.url || ''
  const { path, query } = splitPathAndQuery(rawUrl)

  if (!path) return
  if (path.startsWith('/api/')) return
  if (path.startsWith('/_nuxt/')) return
  if (path.startsWith('/admin')) return

  const normalized = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path

  if (normalized === '/politica-de-privacidade') {
    const location = query ? `/privacidade?${query}` : '/privacidade'
    return sendRedirect(event, location, 301)
  }

  if (normalized === '/termos-de-uso') {
    const location = query ? `/termos?${query}` : '/termos'
    return sendRedirect(event, location, 301)
  }
})
