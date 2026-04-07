import { defineEventHandler, sendRedirect, type H3Event } from 'h3'
import prisma from '../db/prisma'

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
  if (/\.[a-z0-9]+$/i.test(path)) return true
  return false
}

export default defineEventHandler(async (event: H3Event) => {
  const rawUrl = event.node.req.url || ''
  const { path, query } = splitPathAndQuery(rawUrl)

  if (shouldIgnore(path)) return

  // Produto: /produto/<slug> or /produto/<slug>/
  // Also support locale prefix: /en|es|it|fr/produto/<slug>
  const m = path.match(/^\/(?:(en|es|it|fr)\/)?produto\/([^\/]+)\/?$/)
  if (!m) return

  const localePrefix = m[1] ? `/${m[1]}` : ''

  const requestedSlug = decodeURIComponent(m[2] || '').trim()
  if (!requestedSlug) return

  try {
    // If a product with this slug exists, do nothing
    const direct = await prisma.produto.findUnique({ where: { slug: requestedSlug }, select: { id: true } })
    if (direct) return

    // Try to find product by old WP permalink stored in finalUrl
    const like2 = `/produto/${requestedSlug}`

    const byFinalUrl = await prisma.produto.findFirst({
      where: {
        finalUrl: {
          contains: like2
        }
      },
      select: { slug: true }
    })

    if (!byFinalUrl?.slug) return

    const targetPath = `${localePrefix}/produto/${byFinalUrl.slug}`
    const location = query ? `${targetPath}?${query}` : targetPath
    return sendRedirect(event, location, 301)
  } catch (err: any) {
    console.error('[middleware][wp-permalink-redirect] db error', err?.message || err)
  }
})
