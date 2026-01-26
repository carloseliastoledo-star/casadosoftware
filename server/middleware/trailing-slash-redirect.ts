import { defineEventHandler, sendRedirect, type H3Event } from 'h3'
import prisma from '../db/prisma'

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

export default defineEventHandler(async (event: H3Event) => {
  const path = event.path || ''
  if (shouldIgnore(path)) return

  if (!path.endsWith('/')) return

  // Special case: old WP/Woo product permalink with trailing slash.
  // If the requested slug does not exist, but we have a product that stored
  // that old permalink in finalUrl, redirect directly to the current slug.
  const m = path.match(/^\/produto\/([^\/]+)\/+$/)
  if (m) {
    const requestedSlug = decodeURIComponent(String(m[1] || '')).trim()
    if (requestedSlug) {
      const direct = await prisma.produto.findUnique({ where: { slug: requestedSlug }, select: { id: true } })
      if (!direct) {
        const byFinalUrl = await prisma.produto.findFirst({
          where: {
            finalUrl: {
              contains: `/produto/${requestedSlug}`
            }
          },
          select: { slug: true }
        })

        if (byFinalUrl?.slug) {
          const search = event.node.req.url?.split('?')[1]
          const target = `/produto/${byFinalUrl.slug}`
          const location = search ? `${target}?${search}` : target
          return sendRedirect(event, location, 301)
        }
      }
    }
  }

  const targetPath = path.replace(/\/+$/, '')
  const search = event.node.req.url?.split('?')[1]
  const location = search ? `${targetPath}?${search}` : targetPath

  return sendRedirect(event, location, 301)
})
