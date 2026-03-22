/**
 * Shared utility for building XML sitemaps per language.
 * Used by server/routes/sitemap-*.xml.ts
 */
import prisma from '#root/server/db/prisma'

export type LangConfig = {
  lang: 'pt' | 'en' | 'es' | 'fr' | 'it'
  base: string
  productPath: (slug: string) => string
  categoryPath: (slug: string) => string
  blogPath: (slug: string) => string
  productsPath: string
  categoriesPath: string
  blogIndexPath: string
}

export const LANG_CONFIGS: LangConfig[] = [
  {
    lang: 'pt',
    base: 'https://casadosoftware.com.br',
    productPath:  (s) => `/produto/${s}`,
    categoryPath: (s) => `/categoria/${s}`,
    blogPath:     (s) => `/blog/${s}`,
    productsPath:    '/produtos',
    categoriesPath:  '/categorias',
    blogIndexPath:   '/blog'
  },
  {
    lang: 'en',
    base: 'https://casadosoftware.com.br',
    productPath:  (s) => `/en/product/${s}`,
    categoryPath: (s) => `/en/category/${s}`,
    blogPath:     (s) => `/en/blog/${s}`,
    productsPath:    '/en/products',
    categoriesPath:  '/en/categories',
    blogIndexPath:   '/en/blog'
  },
  {
    lang: 'es',
    base: 'https://casadosoftware.com.br',
    productPath:  (s) => `/es/producto/${s}`,
    categoryPath: (s) => `/es/categoria/${s}`,
    blogPath:     (s) => `/es/blog/${s}`,
    productsPath:    '/es/productos',
    categoriesPath:  '/es/categorias',
    blogIndexPath:   '/es/blog'
  },
  {
    lang: 'fr',
    base: 'https://casadosoftware.com.br',
    productPath:  (s) => `/fr/produit/${s}`,
    categoryPath: (s) => `/fr/categorie/${s}`,
    blogPath:     (s) => `/fr/blog/${s}`,
    productsPath:    '/fr/produits',
    categoriesPath:  '/fr/categories',
    blogIndexPath:   '/fr/blog'
  },
  {
    lang: 'it',
    base: 'https://casadosoftware.com.br',
    productPath:  (s) => `/it/prodotto/${s}`,
    categoryPath: (s) => `/it/categoria/${s}`,
    blogPath:     (s) => `/it/blog/${s}`,
    productsPath:    '/it/prodotti',
    categoriesPath:  '/it/categorie',
    blogIndexPath:   '/it/blog'
  }
]

export function escXml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(loc: string, lastmod?: string, priority = '0.8', changefreq = 'weekly'): string {
  const lm = lastmod ? `<lastmod>${escXml(lastmod)}</lastmod>` : ''
  return `<url><loc>${escXml(loc)}</loc>${lm}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
}

export async function buildSitemapForLang(cfg: LangConfig): Promise<string> {
  let products: Array<{ slug: string; criadoEm: Date | null }> = []
  let categories: Array<{ slug: string }> = []
  let posts: Array<{ slug: string; atualizadoEm: Date | null }> = []

  try {
    const [p, c, b] = await Promise.all([
      prisma.produto.findMany({ where: { ativo: true }, select: { slug: true, criadoEm: true } }),
      prisma.categoria.findMany({ select: { slug: true } }),
      (prisma as any).blogPost.findMany({ where: { publicado: true }, select: { slug: true, atualizadoEm: true } })
    ])
    products = p || []
    categories = c || []
    posts = b || []
  } catch {
    // DB unavailable — return minimal sitemap
  }

  const b = cfg.base
  const urls: string[] = []

  const homePath = cfg.lang === 'pt' ? '/' : `/${cfg.lang}`
  urls.push(urlEntry(b + homePath, undefined, '1.0', 'daily'))
  urls.push(urlEntry(b + cfg.blogIndexPath, undefined, '0.9', 'daily'))
  urls.push(urlEntry(b + cfg.productsPath, undefined, '0.8', 'weekly'))
  urls.push(urlEntry(b + cfg.categoriesPath, undefined, '0.7', 'weekly'))

  for (const c of categories) {
    if (!c?.slug) continue
    urls.push(urlEntry(b + cfg.categoryPath(c.slug), undefined, '0.8', 'weekly'))
  }

  for (const p of products) {
    if (!p?.slug) continue
    const lm = p.criadoEm ? new Date(p.criadoEm).toISOString().slice(0, 10) : ''
    urls.push(urlEntry(b + cfg.productPath(p.slug), lm || undefined, '0.9', 'weekly'))
  }

  for (const post of posts) {
    const slug = String(post?.slug || '').trim()
    if (!slug) continue
    const lm = post.atualizadoEm ? new Date(post.atualizadoEm).toISOString().slice(0, 10) : ''
    urls.push(urlEntry(b + cfg.blogPath(slug), lm || undefined, '0.7', 'monthly'))
  }

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join('\n') +
    '\n</urlset>'
  )
}
