import { defineEventHandler, sendRedirect, type H3Event } from 'h3'

function normalizeHostHeaderValue(value: unknown): string {
  const raw = String(Array.isArray(value) ? value[0] : value || '')
  if (!raw) return ''
  return raw.split(',')[0]?.trim() || ''
}

function getHost(event: H3Event): string {
  const xfHost = event.node.req.headers['x-forwarded-host']
  const host = xfHost || event.node.req.headers.host
  return normalizeHostHeaderValue(host)
}

function splitHostAndPort(host: string): { hostname: string; port: string } {
  const trimmed = String(host || '').trim()
  if (!trimmed) return { hostname: '', port: '' }
  const idx = trimmed.lastIndexOf(':')
  if (idx > -1 && trimmed.includes('.') && trimmed.slice(idx + 1).match(/^\d+$/)) {
    return { hostname: trimmed.slice(0, idx), port: trimmed.slice(idx) }
  }
  return { hostname: trimmed, port: '' }
}

export default defineEventHandler((event: H3Event) => {
  const host = getHost(event)
  if (!host) return

  const { hostname } = splitHostAndPort(host)
  const lower = hostname.toLowerCase()

  if (lower !== 'licencasdigitais.com.br' && lower !== 'www.licencasdigitais.com.br') return

  const rawUrl = event.node.req.url || '/'
  const location = `https://gvgmallglobal.com${rawUrl}`

  return sendRedirect(event, location, 301)
})
