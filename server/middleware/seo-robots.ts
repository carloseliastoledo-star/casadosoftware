/**
 * Server middleware: add X-Robots-Tag: noindex, nofollow
 * for admin, checkout, cart, and API routes.
 */
import { defineEventHandler, setHeader, getRequestURL } from 'h3'

const NOINDEX_PREFIXES = ['/admin', '/checkout', '/obrigado', '/sucesso', '/upsell', '/api/']

export default defineEventHandler((event) => {
  try {
    const url = getRequestURL(event)
    const path = String(url.pathname || '')
    const isNoindex = NOINDEX_PREFIXES.some((prefix) => path.startsWith(prefix))
    if (isNoindex) {
      setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
    }
  } catch {
    // never break the request
  }
})
