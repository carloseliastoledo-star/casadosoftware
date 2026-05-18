import { defineEventHandler, setHeader, type H3Event } from 'h3'

function splitPathAndQuery(url: string): { path: string; query: string } {
  const idx = url.indexOf('?')
  if (idx === -1) return { path: url, query: '' }
  return { path: url.slice(0, idx), query: url.slice(idx + 1) }
}

function shouldIgnore(path: string): boolean {
  if (!path) return true
  if (path.startsWith('/api/')) return true
  if (path.startsWith('/_nuxt/')) return true
  if (path.startsWith('/admin')) return true
  return false
}

function isWpPath(path: string): boolean {
  const p = path.toLowerCase()
  return (
    p === '/wp-admin' ||
    p.startsWith('/wp-admin/') ||
    p === '/wp-content' ||
    p.startsWith('/wp-content/') ||
    p === '/wp-includes' ||
    p.startsWith('/wp-includes/') ||
    p === '/cgi-bin' ||
    p.startsWith('/cgi-bin/')
  )
}

export default defineEventHandler((event: H3Event) => {
  const rawUrl = event.node.req.url || ''
  const { path } = splitPathAndQuery(rawUrl)

  if (shouldIgnore(path)) return
  if (!isWpPath(path)) return

  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  event.node.res.statusCode = 410
  event.node.res.end('Gone')
})
