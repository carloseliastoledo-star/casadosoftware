/**
 * Central SEO composable for international URL generation.
 * Generates canonical + hreflang alternates for all supported languages.
 * Supports: home, product, category, products-list, categories-list, blog-post, blog-index
 *
 * Cross-domain strategy:
 *   PT / ES / FR / IT  → https://casadosoftware.com.br
 *   EN                 → https://casadosoftware.store  (only when SEO_ENABLE_EN_DOMAIN=true)
 */

export const PT_DOMAIN = 'https://casadosoftware.com.br'
export const EN_DOMAIN = 'https://casadosoftware.store'

export const SEO_LANGS = ['pt', 'en', 'es', 'fr', 'it'] as const
export type SeoLang = typeof SEO_LANGS[number]

export const HREFLANG_CODES: Record<SeoLang, string> = {
  pt: 'pt-BR',
  en: 'en',
  es: 'es',
  fr: 'fr',
  it: 'it'
}

export function sanitizePath(path: string): string {
  return String(path || '').replace(/\?.*$/, '').replace(/#.*$/, '').replace(/\/+$/, '') || '/'
}

export function stripTrackingParams(url: string): string {
  try {
    const u = new URL(url)
    const TRACKING = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid','msclkid']
    TRACKING.forEach(p => u.searchParams.delete(p))
    return u.toString()
  } catch {
    return url
  }
}

export function buildCanonicalByLocale(path: string, lang: SeoLang, enDomain = EN_DOMAIN): string {
  const cleanPath = sanitizePath(path)
  if (lang === 'en') return `${enDomain}${cleanPath === '/' ? '' : cleanPath}`
  return `${PT_DOMAIN}${cleanPath === '/' ? '' : cleanPath}`
}

export function buildAlternateByLocale(pageType: SeoPageType, lang: SeoLang, slug: string, enDomain = EN_DOMAIN): string {
  const path = pathForLang(pageType, lang, slug)
  return buildCanonicalByLocale(path, lang, enDomain)
}

export function isLocaleVersionIndexable(lang: SeoLang, seoEnableEnDomain: boolean): boolean {
  if (lang === 'en') return seoEnableEnDomain
  return true
}

export type SeoPageType =
  | 'home'
  | 'product'
  | 'category'
  | 'products'
  | 'categories'
  | 'blog-post'
  | 'blog-index'
  | 'generic'

export function productPathForLang(lang: SeoLang, slug: string): string {
  if (lang === 'en') return `/en/product/${slug}`
  if (lang === 'es') return `/es/producto/${slug}`
  if (lang === 'fr') return `/fr/produit/${slug}`
  if (lang === 'it') return `/it/prodotto/${slug}`
  return `/produto/${slug}`
}

export function categoryPathForLang(lang: SeoLang, slug: string): string {
  if (lang === 'en') return `/en/category/${slug}`
  if (lang === 'es') return `/es/categoria/${slug}`
  if (lang === 'fr') return `/fr/categorie/${slug}`
  if (lang === 'it') return `/it/categoria/${slug}`
  return `/categoria/${slug}`
}

export function blogPostPathForLang(lang: SeoLang, slug: string): string {
  if (lang === 'pt') return `/blog/${slug}`
  return `/${lang}/blog/${slug}`
}

export function blogIndexPathForLang(lang: SeoLang): string {
  if (lang === 'pt') return '/blog'
  return `/${lang}/blog`
}

export function homePathForLang(lang: SeoLang): string {
  if (lang === 'pt') return '/'
  return `/${lang}`
}

export function productsPathForLang(lang: SeoLang): string {
  if (lang === 'en') return '/en/products'
  if (lang === 'es') return '/es/productos'
  if (lang === 'fr') return '/fr/produits'
  if (lang === 'it') return '/it/prodotti'
  return '/produtos'
}

export function categoriesPathForLang(lang: SeoLang): string {
  if (lang === 'en') return '/en/categories'
  if (lang === 'es') return '/es/categorias'
  if (lang === 'fr') return '/fr/categories'
  if (lang === 'it') return '/it/categorie'
  return '/categorias'
}

export function detectLangFromPath(path: string): SeoLang {
  const p = String(path || '')
  if (p === '/en' || p.startsWith('/en/')) return 'en'
  if (p === '/es' || p.startsWith('/es/')) return 'es'
  if (p === '/fr' || p.startsWith('/fr/')) return 'fr'
  if (p === '/it' || p.startsWith('/it/')) return 'it'
  return 'pt'
}

export function pathForLang(pageType: SeoPageType, lang: SeoLang, slug?: string): string {
  const s = String(slug || '')
  switch (pageType) {
    case 'home': return homePathForLang(lang)
    case 'product': return productPathForLang(lang, s)
    case 'category': return categoryPathForLang(lang, s)
    case 'products': return productsPathForLang(lang)
    case 'categories': return categoriesPathForLang(lang)
    case 'blog-post': return blogPostPathForLang(lang, s)
    case 'blog-index': return blogIndexPathForLang(lang)
    default: return homePathForLang(lang)
  }
}

/**
 * Returns the canonical EN path on casadosoftware.store (no /en/ prefix).
 * On .store the domain itself signals English, so paths are clean.
 */
export function enPathOnStoreDomain(pageType: SeoPageType, slug?: string): string {
  const s = String(slug || '')
  switch (pageType) {
    case 'home': return '/'
    case 'product': return `/product/${s}`
    case 'category': return `/category/${s}`
    case 'products': return '/products'
    case 'categories': return '/categories'
    case 'blog-post': return `/en/blog/${s}`
    case 'blog-index': return '/en/blog'
    default: return '/'
  }
}

export function useSeoLocale(options: {
  pageType: SeoPageType
  slug?: string | Ref<string> | ComputedRef<string>
}) {
  const siteUrl = useSiteUrl()
  const config = useRuntimeConfig()
  const route = useRoute()

  const seoEnableEnDomain = computed(() =>
    Boolean((config.public as any)?.seoEnableEnDomain)
  )
  const ptDomain = computed(() =>
    String((config.public as any)?.ptDomainUrl || '').replace(/\/$/, '') || PT_DOMAIN
  )
  const enDomain = computed(() =>
    String((config.public as any)?.enDomainUrl || '').replace(/\/$/, '') || EN_DOMAIN
  )

  const origin = computed(() =>
    String(siteUrl || '').replace(/\/$/, '') || ptDomain.value
  )

  const slug = computed(() => {
    const s = options.slug
    if (!s) return ''
    if (typeof s === 'string') return s
    return String(s.value || '')
  })

  const currentLang = computed<SeoLang>(() => detectLangFromPath(route.path))

  const canonicalUrl = computed(() => {
    const path = pathForLang(options.pageType, currentLang.value, slug.value)
    return `${origin.value}${path}`
  })

  // EN domain is active if the flag is set OR the current request is already on .store
  const isOnEnDomain = computed(() =>
    String(origin.value).endsWith('.store') || seoEnableEnDomain.value
  )

  const hreflangLinks = computed(() => {
    const links: Array<{ rel: string; hreflang: string; href: string }> = []
    for (const lang of SEO_LANGS) {
      if (lang === 'en' && !isOnEnDomain.value) continue
      let href: string
      if (lang === 'en') {
        // Use canonical .store paths (no /en/ prefix — domain itself signals language)
        const enPath = enPathOnStoreDomain(options.pageType, slug.value)
        href = `${enDomain.value}${enPath}`
      } else {
        const path = pathForLang(options.pageType, lang, slug.value)
        href = `${ptDomain.value}${path}`
      }
      links.push({ rel: 'alternate', hreflang: HREFLANG_CODES[lang], href })
    }
    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${ptDomain.value}${pathForLang(options.pageType, 'pt', slug.value)}`
    })
    return links
  })

  function applyToHead() {
    useHead(() => ({
      link: [
        { rel: 'canonical', href: canonicalUrl.value },
        ...hreflangLinks.value
      ]
    }))
  }

  return { canonicalUrl, hreflangLinks, currentLang, applyToHead }
}
