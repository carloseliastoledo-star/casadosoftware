/**
 * Central SEO composable for international URL generation.
 * Generates canonical + hreflang alternates for all supported languages.
 * Supports: home, product, category, products-list, categories-list, blog-post, blog-index
 */

export const SEO_LANGS = ['pt', 'en', 'es', 'fr', 'it'] as const
export type SeoLang = typeof SEO_LANGS[number]

export const HREFLANG_CODES: Record<SeoLang, string> = {
  pt: 'pt-BR',
  en: 'en',
  es: 'es',
  fr: 'fr',
  it: 'it'
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

export function useSeoLocale(options: {
  pageType: SeoPageType
  slug?: string | Ref<string> | ComputedRef<string>
}) {
  const siteUrl = useSiteUrl()
  const route = useRoute()

  const origin = computed(() =>
    String(siteUrl || '').replace(/\/$/, '') || 'https://casadosoftware.com.br'
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

  const hreflangLinks = computed(() => {
    const links: Array<{ rel: string; hreflang: string; href: string }> = []
    for (const lang of SEO_LANGS) {
      const path = pathForLang(options.pageType, lang, slug.value)
      links.push({ rel: 'alternate', hreflang: HREFLANG_CODES[lang], href: `${origin.value}${path}` })
    }
    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${origin.value}${pathForLang(options.pageType, 'pt', slug.value)}`
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
