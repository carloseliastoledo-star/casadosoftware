import { defineEventHandler, sendRedirect, type H3Event } from 'h3'
import { getAdminSession } from '../utils/adminSession.js'

function shouldIgnore(path: string): boolean {
  if (!path) return true
  if (path.startsWith('/api/')) return true
  if (path.startsWith('/_nuxt/')) return true
  if (path.startsWith('/__nuxt_error')) return true
  if (path === '/favicon.ico') return true
  if (path === '/robots.txt') return true
  if (path === '/site.webmanifest') return true
  if (path === '/admin/login') return true
  if (path.startsWith('/admin/login/')) return true
  if (path === '/admin/auth') return true
  if (path.startsWith('/admin/auth/')) return true
  if (path === '/admin') return false
  if (path.startsWith('/admin/')) return false
  return true
}

export default defineEventHandler((event: H3Event) => {
  const rawUrl = event.node.req.url || ''
  const path = (rawUrl.split('?')[0] || '').trim()

  if (shouldIgnore(path)) return

  const session = getAdminSession(event)
  if (session) return

  const redirectTo = encodeURIComponent(rawUrl || '/admin')
  return sendRedirect(event, `/admin/login?redirect=${redirectTo}`, 302)
})
