import { defineEventHandler, setHeader, getRequestURL } from 'h3'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  const reqUrl = getRequestURL(event)

  const hostname = String(reqUrl.hostname || '').trim() || 'casadosoftware.com.br'
  const origin = `https://${hostname}`

  return (
    'User-agent: *\n' +
    'Disallow: /admin\n' +
    'Disallow: /api\n' +
    'Allow: /\n' +
    '\n' +
    `Sitemap: ${origin}/sitemap.xml\n`
  )
})
