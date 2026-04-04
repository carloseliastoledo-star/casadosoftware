import { defineEventHandler, setHeader } from 'h3'
import { buildSitemapForLang, LANG_CONFIGS, isSeoEnEnDomainEnabled } from '#root/server/utils/sitemapBuilder'

const EMPTY_SITEMAP = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-store, max-age=0')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')

  if (!isSeoEnEnDomainEnabled()) {
    setHeader(event, 'X-Robots-Tag', 'noindex')
    return EMPTY_SITEMAP
  }

  const cfg = LANG_CONFIGS.find(c => c.lang === 'en')
  if (!cfg) return EMPTY_SITEMAP
  return buildSitemapForLang(cfg)
})
