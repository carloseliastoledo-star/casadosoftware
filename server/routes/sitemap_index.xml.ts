import { defineEventHandler, setHeader } from 'h3'

const PT_BASE = (process.env.SITE_URL || '').replace(/\/$/, '') || 'https://casadosoftware.com.br'
const EN_BASE = (process.env.EN_DOMAIN_URL || '').replace(/\/$/, '') || 'https://casadosoftware.store'
const SEO_ENABLE_EN = String(process.env.SEO_ENABLE_EN_DOMAIN || '').trim().toLowerCase() === 'true'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-store, max-age=0')

  const now = new Date().toISOString().slice(0, 10)
  const entries: string[] = []

  entries.push(`  <sitemap><loc>${PT_BASE}/sitemap.xml</loc><lastmod>${now}</lastmod></sitemap>`)
  if (SEO_ENABLE_EN) {
    entries.push(`  <sitemap><loc>${EN_BASE}/sitemap-en.xml</loc><lastmod>${now}</lastmod></sitemap>`)
  }
  entries.push(`  <sitemap><loc>${PT_BASE}/sitemap-es.xml</loc><lastmod>${now}</lastmod></sitemap>`)
  entries.push(`  <sitemap><loc>${PT_BASE}/sitemap-fr.xml</loc><lastmod>${now}</lastmod></sitemap>`)
  entries.push(`  <sitemap><loc>${PT_BASE}/sitemap-it.xml</loc><lastmod>${now}</lastmod></sitemap>`)

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join('\n') + '\n' +
    '</sitemapindex>'
  )
})
