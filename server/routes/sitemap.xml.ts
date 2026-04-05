import { defineEventHandler, setHeader, getRequestHeader } from 'h3'
import { buildSitemapForLang, LANG_CONFIGS, EN_STORE_CONFIG } from '#root/server/utils/sitemapBuilder'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Cache-Control', 'no-store, max-age=0')

  const rawHost = String(
    getRequestHeader(event, 'x-forwarded-host') ||
    getRequestHeader(event, 'host') || ''
  ).split(',')[0]?.trim().toLowerCase() || ''

  const isEnDomain = rawHost.endsWith('.store')
  const cfg = isEnDomain ? EN_STORE_CONFIG : LANG_CONFIGS.find(c => c.lang === 'pt')!
  return buildSitemapForLang(cfg)
})
