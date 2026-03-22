import { defineEventHandler, setHeader } from 'h3'
import { buildSitemapForLang, LANG_CONFIGS } from '#root/server/utils/sitemapBuilder'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-store, max-age=0')

  const cfg = LANG_CONFIGS.find(c => c.lang === 'fr')!
  return buildSitemapForLang(cfg)
})
