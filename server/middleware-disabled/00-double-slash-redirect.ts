import { defineEventHandler, sendRedirect, type H3Event } from 'h3'

function splitPathAndQuery(url: string): { path: string; query: string } {
  const idx = url.indexOf('?')
  if (idx === -1) return { path: url, query: '' }
  return { path: url.slice(0, idx), query: url.slice(idx + 1) }
}

function shouldIgnore(path: string): boolean {
  if (!path) return true
  if (path.startsWith('/api/')) return true
  if (path.startsWith('/_nuxt/')) return true
  if (path.startsWith('/__nuxt_error')) return true
  if (path.startsWith('/admin')) return true
  if (/\.[a-z0-9]+$/i.test(path)) return true
  return false
}

export default defineEventHandler((event: H3Event) => {
  const rawUrl = event.node.req.url || ''
  const { path, query } = splitPathAndQuery(rawUrl)

  if (shouldIgnore(path)) return
  if (!path.includes('//')) return

  const normalized = path.replace(/\/{2,}/g, '/')
  if (normalized === path) return

  const location = query ? `${normalized}?${query}` : normalized
  return sendRedirect(event, location, 301)
})
