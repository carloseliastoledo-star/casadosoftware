/**
 * Shared utility for building XML sitemaps per language.
 * Used by server/routes/sitemap-*.xml.ts
 */
import prisma from '#root/server/db/prisma'

export type LangConfig = {
  lang: 'pt' | 'en' | 'es' | 'fr' | 'it'
  base: string
  homePath: string
  productPath: (slug: string) => string
  categoryPath: (slug: string) => string
  blogPath: (slug: string) => string
  productsPath: string
  categoriesPath: string
  blogIndexPath: string
}

const PT_BASE = 'https://casadosoftware.com.br'
const EN_BASE = 'https://casadosoftware.store'

export function isSeoEnEnDomainEnabled(): boolean {
  return String(process.env.SEO_ENABLE_EN_DOMAIN || '').trim().toLowerCase() === 'true'
}

export const LANG_CONFIGS: LangConfig[] = [
  {
    lang: 'pt',
    base: PT_BASE,
    homePath:        '/',
    productPath:  (s) => `/produto/${s}`,
    categoryPath: (s) => `/categoria/${s}`,
    blogPath:     (s) => `/blog/${s}`,
    productsPath:    '/produtos',
    categoriesPath:  '/categorias',
    blogIndexPath:   '/blog'
  },
  {
    lang: 'en',
    base: EN_BASE,
    homePath:        '/en',
    productPath:  (s) => `/en/product/${s}`,
    categoryPath: (s) => `/en/category/${s}`,
    blogPath:     (s) => `/en/blog/${s}`,
    productsPath:    '/en/products',
    categoriesPath:  '/en/categories',
    blogIndexPath:   '/en/blog'
  },
  {
    lang: 'es',
    base: PT_BASE,
    homePath:        '/es',
    productPath:  (s) => `/es/producto/${s}`,
    categoryPath: (s) => `/es/categoria/${s}`,
    blogPath:     (s) => `/es/blog/${s}`,
    productsPath:    '/es/productos',
    categoriesPath:  '/es/categorias',
    blogIndexPath:   '/es/blog'
  },
  {
    lang: 'fr',
    base: PT_BASE,
    homePath:        '/fr',
    productPath:  (s) => `/fr/produit/${s}`,
    categoryPath: (s) => `/fr/categorie/${s}`,
    blogPath:     (s) => `/fr/blog/${s}`,
    productsPath:    '/fr/produits',
    categoriesPath:  '/fr/categories',
    blogIndexPath:   '/fr/blog'
  },
  {
    lang: 'it',
    base: PT_BASE,
    homePath:        '/it',
    productPath:  (s) => `/it/prodotto/${s}`,
    categoryPath: (s) => `/it/categoria/${s}`,
    blogPath:     (s) => `/it/blog/${s}`,
    productsPath:    '/it/prodotti',
    categoriesPath:  '/it/categorie',
    blogIndexPath:   '/it/blog'
  }
]

/** EN config for casadosoftware.store — clean paths without /en/ prefix */
export const EN_STORE_CONFIG: LangConfig = {
  lang: 'en',
  base: EN_BASE,
  homePath:        '/',
  productPath:  (s) => `/product/${s}`,
  categoryPath: (s) => `/category/${s}`,
  blogPath:     (s) => `/en/blog/${s}`,
  productsPath:    '/products',
  categoriesPath:  '/categories',
  blogIndexPath:   '/en/blog'
}

export function escXml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function safeSlug(s: unknown): string {
  return encodeURIComponent(String(s ?? '').trim())
}

function urlEntry(loc: string, lastmod?: string, priority = '0.8', changefreq = 'weekly'): string {
  const escapedLoc = escXml(String(loc ?? '').trim())
  if (!escapedLoc) return ''
  const lm = lastmod ? `<lastmod>${escXml(lastmod)}</lastmod>` : ''
  return `<url><loc>${escapedLoc}</loc>${lm}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
}

export async function buildSitemapForLang(cfg: LangConfig): Promise<string> {
  let products: Array<{ slug: string; criadoEm: Date | null }> = []
  let categories: Array<{ slug: string }> = []
  let posts: Array<{ slug: string; atualizadoEm: Date | null }> = []
  let seoPages: Array<{ slug: string; updatedAt: Date | null }> = []

  const seoLocale = cfg.lang === 'en' ? 'en' : 'pt'

  try {
    const results = await Promise.all([
      prisma.produto.findMany({ where: { ativo: true }, select: { slug: true, criadoEm: true } }),
      prisma.categoria.findMany({ select: { slug: true } }),
      (prisma as any).blogPost.findMany({ where: { publicado: true }, select: { slug: true, atualizadoEm: true } }),
      (prisma as any).seoPage.findMany({
        where: { locale: seoLocale, status: 'published', noindex: false },
        select: { slug: true, updatedAt: true }
      })
    ])
    products = results[0] || []
    categories = results[1] || []
    posts = results[2] || []
    seoPages = results[3] || []
  } catch {
    // DB unavailable — return minimal valid sitemap
  }

  const envBase = (process.env.SITE_URL || '').replace(/\/$/, '')
  const base = cfg.lang === 'en'
    ? (process.env.EN_DOMAIN_URL || '').replace(/\/$/, '') || cfg.base
    : envBase || cfg.base
  const entries: string[] = []

  // Home
  entries.push(urlEntry(base + cfg.homePath, undefined, '1.0', 'daily'))

  // Blog index
  entries.push(urlEntry(base + cfg.blogIndexPath, undefined, '0.9', 'daily'))

  // Categories (individual pages only — no listing page for intl)
  for (const cat of categories) {
    const s = safeSlug(cat?.slug)
    if (!s) continue
    entries.push(urlEntry(base + cfg.categoryPath(s), undefined, '0.8', 'weekly'))
  }

  // Products
  for (const prod of products) {
    const s = safeSlug(prod?.slug)
    if (!s) continue
    const lastmod = prod.criadoEm ? new Date(prod.criadoEm).toISOString().slice(0, 10) : undefined
    entries.push(urlEntry(base + cfg.productPath(s), lastmod, '0.9', 'weekly'))
  }

  // Blog posts
  for (const post of posts) {
    const s = safeSlug(post?.slug)
    if (!s) continue
    const lastmod = post.atualizadoEm ? new Date(post.atualizadoEm).toISOString().slice(0, 10) : undefined
    entries.push(urlEntry(base + cfg.blogPath(s), lastmod, '0.7', 'monthly'))
  }

  // SEO Pages (published, not noindex, matching locale)
  for (const sp of seoPages) {
    const s = safeSlug(sp?.slug)
    if (!s) continue
    const lastmod = sp.updatedAt ? new Date(sp.updatedAt).toISOString().slice(0, 10) : undefined
    entries.push(urlEntry(`${base}/lp/${s}`, lastmod, '0.8', 'weekly'))
  }

  const validEntries = entries.filter(Boolean)

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...validEntries,
    '</urlset>'
  ].join('\n')
}
