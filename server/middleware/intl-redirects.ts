/**
 * 301 redirects for legacy gvgmall.co URLs and www canonicalization.
 * - /products/:slug        → /product/:slug
 * - /blogs/news/:slug      → /blog/:slug
 * - /collections/*         → /products
 * - http://gvgmall.co/*   → https://www.gvgmall.co/*  (www canonical)
 */
import { defineEventHandler, sendRedirect, getRequestURL, getRequestHeader } from 'h3'

export default defineEventHandler((event) => {
  try {
    const url = getRequestURL(event)
    const path = url.pathname

    // ── 1. Legacy /products/:slug → /product/:slug ──────────────────────────
    const productsMatch = path.match(/^\/products\/(.+)$/)
    if (productsMatch) {
      return sendRedirect(event, `/product/${productsMatch[1]}${url.search}`, 301)
    }

    // ── 2. Legacy /blogs/news/:slug → /blog/:slug ────────────────────────────
    const blogsMatch = path.match(/^\/blogs\/news\/(.+)$/)
    if (blogsMatch) {
      return sendRedirect(event, `/blog/${blogsMatch[1]}${url.search}`, 301)
    }

    // ── 3. Legacy /collections/* → /products ────────────────────────────────
    if (path.startsWith('/collections/') || path === '/collections') {
      return sendRedirect(event, '/products', 301)
    }

    // ── 4. www canonicalization: gvgmall.co → www.gvgmall.co ────────────────
    const host =
      getRequestHeader(event, 'x-forwarded-host') ||
      getRequestHeader(event, 'host') || ''
    const cleanHost = String(host).split(',')[0]?.trim().toLowerCase() || ''

    if (cleanHost === 'gvgmall.co') {
      const target = `https://www.gvgmall.co${path}${url.search}`
      return sendRedirect(event, target, 301)
    }
  } catch {
    // never break the request
  }
})
