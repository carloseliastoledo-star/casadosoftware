import { defineEventHandler, type H3Event, setHeader } from 'h3'

function shouldIgnore(path: string): boolean {
  if (!path) return true

  if (path.startsWith('/api/')) return true
  if (path.startsWith('/_nuxt/')) return true
  if (path.startsWith('/__nuxt_error')) return true
  if (path.startsWith('/admin')) return true

  // ignore files with extensions (e.g. .png, .css, .js)
  if (/\.[a-z0-9]+$/i.test(path)) return true

  return false
}

export default defineEventHandler((event: H3Event) => {
  const path = event.path || ''
  if (shouldIgnore(path)) return

  // Only for product pages HTML
  if (!path.startsWith('/produto/')) return

  setHeader(event, 'cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  setHeader(event, 'pragma', 'no-cache')
  setHeader(event, 'expires', '0')
  setHeader(event, 'x-product-no-cache', '1')
})
