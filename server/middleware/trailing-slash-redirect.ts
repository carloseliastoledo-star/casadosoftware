import { defineEventHandler, sendRedirect, type H3Event } from 'h3'

function shouldIgnore(path: string): boolean {
  if (!path) return true
  if (path === '/') return true

  // ignore API and common assets
  if (path.startsWith('/api/')) return true
  if (path.startsWith('/_nuxt/')) return true
  if (path.startsWith('/__nuxt_error')) return true

  // ignore files with extensions (e.g. .png, .css)
  if (/\.[a-z0-9]+$/i.test(path)) return true

  return false
}

export default defineEventHandler((event: H3Event) => {
  const path = event.path || ''
  if (shouldIgnore(path)) return

  if (!path.endsWith('/')) return

  const targetPath = path.replace(/\/+$/, '')
  const search = event.node.req.url?.split('?')[1]
  const location = search ? `${targetPath}?${search}` : targetPath

  return sendRedirect(event, location, 301)
})
