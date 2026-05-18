import { defineEventHandler, setHeader, getRequestHeader } from 'h3'
import { buildSitemapForLang, LANG_CONFIGS, EN_STORE_CONFIG, type LangConfig } from '#root/server/utils/sitemapBuilder'

/** EN config for gvgmall.co — www canonical, clean /product/ paths */
const GVGMALL_CONFIG: LangConfig = {
  lang: 'en',
  base: 'https://www.gvgmall.co',
  homePath:        '/',
  productPath:  (s) => `/product/${s}`,
  categoryPath: (s) => `/category/${s}`,
  blogPath:     (s) => `/blog/${s}`,
  productsPath:    '/products',
  categoriesPath:  '/categories',
  blogIndexPath:   '/blog'
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Cache-Control', 'no-store, max-age=0')

  const rawHost = String(
    getRequestHeader(event, 'x-forwarded-host') ||
    getRequestHeader(event, 'host') || ''
  ).split(',')[0]?.trim().toLowerCase() || ''

  const isGvgmall = rawHost.includes('gvgmall.co')
  const isEnDomain = rawHost.endsWith('.store')

  let cfg: LangConfig
  if (isGvgmall) cfg = GVGMALL_CONFIG
  else if (isEnDomain) cfg = EN_STORE_CONFIG
  else cfg = LANG_CONFIGS.find(c => c.lang === 'pt')!

  return buildSitemapForLang(cfg)
})
