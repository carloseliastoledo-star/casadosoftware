import { H3Event, getHeader, getCookie } from 'h3'

export function detectCountry(event: H3Event): string {
  // Vercel edge header
  const vercel = getHeader(event, 'x-vercel-ip-country')
  if (vercel) return vercel.trim().toUpperCase()

  // Cloudflare header
  const cf = getHeader(event, 'cf-ipcountry')
  if (cf && cf !== 'XX') return cf.trim().toUpperCase()

  // Cookie set by client-side geolocation
  const cookie = getCookie(event, 'ld_country')
  if (cookie) return cookie.trim().toUpperCase()

  return 'BR'
}

export function isBrazil(event: H3Event): boolean {
  return detectCountry(event) === 'BR'
}
