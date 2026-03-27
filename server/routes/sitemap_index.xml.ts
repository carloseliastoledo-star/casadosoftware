import { defineEventHandler, setHeader } from 'h3'

const BASE = (process.env.SITE_URL || '').replace(/\/$/, '') || 'https://casadosoftware.com.br'
const LANGS = ['pt', 'en', 'es', 'fr', 'it'] as const

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-store, max-age=0')

  const now = new Date().toISOString().slice(0, 10)

  const entries = LANGS.map((lang) => {
    const loc = lang === 'pt' ? `${BASE}/sitemap.xml` : `${BASE}/sitemap-${lang}.xml`
    return `  <sitemap><loc>${loc}</loc><lastmod>${now}</lastmod></sitemap>`
  }).join('\n')

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries + '\n' +
    '</sitemapindex>'
  )
})
