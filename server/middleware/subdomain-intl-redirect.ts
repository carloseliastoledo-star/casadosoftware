/**
 * Server middleware: 301 redirect from international subdomains to subdirectories.
 * en.casadosoftware.com.br/{path} → casadosoftware.com.br/en/{mapped-path}
 * Runs only for casadosoftware.com.br subdomain traffic.
 */
import { defineEventHandler, sendRedirect, getRequestURL, getRequestHeader } from 'h3'

const MAIN_HOST = 'casadosoftware.com.br'

function detectSubdomain(host: string): string | null {
  const h = String(host || '').toLowerCase().split(':')[0]
  if (h.startsWith('en.') && h.includes(MAIN_HOST)) return 'en'
  if (h.startsWith('es.') && h.includes(MAIN_HOST)) return 'es'
  if (h.startsWith('fr.') && h.includes(MAIN_HOST)) return 'fr'
  if (h.startsWith('it.') && h.includes(MAIN_HOST)) return 'it'
  if (h.startsWith('pt.') && h.includes(MAIN_HOST)) return 'pt'
  return null
}

function mapPathToLang(lang: string, pathname: string): string {
  const p = pathname === '/' ? '' : pathname.replace(/\/$/, '')

  // Skip API/admin/static routes
  if (p.startsWith('/api/') || p.startsWith('/admin') || p.startsWith('/_nuxt') || p.startsWith('/sitemap')) {
    return p || '/'
  }

  // PT subdom → PT root (no prefix needed)
  if (lang === 'pt') return p || '/'

  // Map common PT paths to their lang equivalents
  const ptToLang: Record<string, Record<string, string>> = {
    en: {
      '/produtos':   '/en/products',
      '/categorias': '/en/categories',
      '/produto':    '/en/product',
      '/product':    '/en/product',
      '/categoria':  '/en/category',
      '/category':   '/en/category',
      '/blog':       '/en/blog',
      '/quem-somos': '/en/about-us',
      '/entrega-digital': '/en/digital-delivery',
      '/reembolso':  '/en/refund-policy',
      '/privacidade': '/en/privacy-policy',
      '/termos':     '/en/terms-of-use'
    },
    es: {
      '/produtos':   '/es/productos',
      '/categorias': '/es/categorias',
      '/produto':    '/es/producto',
      '/producto':   '/es/producto',
      '/categoria':  '/es/categoria',
      '/categorias': '/es/categorias',
      '/blog':       '/es/blog'
    },
    fr: {
      '/produtos':   '/fr/produits',
      '/categorias': '/fr/categories',
      '/produto':    '/fr/produit',
      '/categoria':  '/fr/categorie',
      '/blog':       '/fr/blog'
    },
    it: {
      '/produtos':   '/it/prodotti',
      '/categorias': '/it/categorie',
      '/produto':    '/it/prodotto',
      '/categoria':  '/it/categoria',
      '/blog':       '/it/blog'
    }
  }

  const map = ptToLang[lang] || {}

  // Check exact match first
  if (map[p]) return map[p]

  // Check prefix matches (e.g. /produto/slug → /en/product/slug)
  for (const [from, to] of Object.entries(map)) {
    if (p.startsWith(from + '/')) {
      return to + p.slice(from.length)
    }
  }

  // Already has lang prefix → keep as-is under lang
  if (p.startsWith(`/${lang}/`)) return p

  // Generic fallback: prepend lang prefix
  return `/${lang}${p || '/'}`
}

export default defineEventHandler((event) => {
  try {
    const url = getRequestURL(event)
    const rawHost =
      getRequestHeader(event, 'x-forwarded-host') ||
      getRequestHeader(event, 'host') ||
      ''
    const host = String(rawHost).split(',')[0]?.trim().toLowerCase() || ''

    const lang = detectSubdomain(host)
    if (!lang) return

    const targetPath = mapPathToLang(lang, url.pathname)
    const query = url.search || ''
    const targetUrl = `https://${MAIN_HOST}${targetPath}${query}`

    // Avoid redirect loop
    if (targetUrl === url.href) return

    return sendRedirect(event, targetUrl, 301)
  } catch {
    // Never break the request
  }
})
