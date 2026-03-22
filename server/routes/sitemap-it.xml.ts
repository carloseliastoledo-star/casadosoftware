import { defineEventHandler, setHeader } from 'h3'
import { buildSitemapForLang, LANG_CONFIGS } from '#root/server/utils/sitemapBuilder'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-store, max-age=0')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')

  const cfg = LANG_CONFIGS.find(c => c.lang === 'it')
  if (!cfg) return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
  return buildSitemapForLang(cfg)
})
