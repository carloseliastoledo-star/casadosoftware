import { defineEventHandler, getCookie, getRequestHeader, setCookie } from 'h3'

function normalizeCountryCode(input: unknown) {
  const raw = String(input || '').trim().toUpperCase()
  if (!raw) return ''
  const first = raw.split(',')[0]?.trim() || ''
  const clean = first.replace(/[^A-Z]/g, '')
  if (clean.length !== 2) return ''
  return clean
}

export default defineEventHandler((event) => {
  const existing = normalizeCountryCode(getCookie(event, 'ld_country'))
  if (existing) return

  const headersToCheck = [
    'cf-ipcountry',
    'x-vercel-ip-country',
    'x-country',
    'x-geo-country',
    'fastly-client-country'
  ]

  let detected = ''
  for (const h of headersToCheck) {
    const v = normalizeCountryCode(getRequestHeader(event, h))
    if (v) {
      detected = v
      break
    }
  }

  if (!detected) return

  setCookie(event, 'ld_country', detected, {
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })
})
