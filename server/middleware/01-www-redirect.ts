import { defineEventHandler, sendRedirect, type H3Event } from 'h3'

function getHost(event: H3Event): string {
  const xfHost = event.node.req.headers['x-forwarded-host']
  const host = xfHost || event.node.req.headers.host
  return String(Array.isArray(host) ? host[0] : host || '')
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

  const { hostname, port } = splitHostAndPort(host)
  const lower = hostname.toLowerCase()

  if (lower !== 'www.casadosoftware.com.br' && lower !== 'www.licencasdigitais.com.br') return

  const rawUrl = event.node.req.url || '/'
  const apex = lower === 'www.licencasdigitais.com.br' ? 'licencasdigitais.com.br' : 'casadosoftware.com.br'
  const targetHost = `${apex}${port}`
  const location = `https://${targetHost}${rawUrl}`

  return sendRedirect(event, location, 301)
})
