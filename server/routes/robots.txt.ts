import { defineEventHandler, setHeader, getRequestURL } from 'h3'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  const reqUrl = getRequestURL(event)
  const base = String(reqUrl.origin || '').trim().replace(/\/$/, '')

  return [
    'User-agent: *',
    'Disallow: /admin',
    'Disallow: /api',
    'Allow: /',
    `Sitemap: ${base}/sitemap.xml`,
    ''
  ].join('\n')
})
