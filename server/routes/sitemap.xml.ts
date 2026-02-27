import { defineEventHandler, setHeader, getRequestURL } from 'h3'

function escXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function getLangFromHost(host: string) {
  const h = String(host || '').toLowerCase()
  if (h.startsWith('en.')) return 'en'
  if (h.startsWith('es.')) return 'es'
  if (h.startsWith('fr.')) return 'fr'
  if (h.startsWith('de.')) return 'de'
  return 'pt-BR'
}

function getOriginForLang(lang: string) {
  if (lang === 'en') return 'https://en.casadosoftware.com.br'
  if (lang === 'es') return 'https://es.casadosoftware.com.br'
  if (lang === 'fr') return 'https://fr.casadosoftware.com.br'
  if (lang === 'de') return 'https://de.casadosoftware.com.br'
  return 'https://casadosoftware.com.br'
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')

  const reqUrl = getRequestURL(event)
  const base = String(reqUrl.origin || '').replace(/\/$/, '')
  const lang = getLangFromHost(String(reqUrl.hostname || ''))

  const urls: { loc: string; path: string; lastmod?: string }[] = []
  urls.push({ loc: `${base}/`, path: '/', lastmod: new Date().toISOString().slice(0, 10) })

  const productsIndexPath =
    lang === 'en' ? '/products' :
      lang === 'es' ? '/productos' :
        lang === 'fr' ? '/produits' :
          lang === 'de' ? '/produkte' :
            '/produtos'
  urls.push({ loc: `${base}${productsIndexPath}`, path: productsIndexPath })

  try {
    const { default: prisma } = await import('#root/server/db/prisma')

    const [produtos, categorias] = await Promise.all([
      prisma.produto.findMany({
        where: { ativo: true },
        select: { slug: true, criadoEm: true },
        orderBy: { criadoEm: 'desc' }
      }),
      prisma.categoria.findMany({
        select: { slug: true }
      })
    ])

    for (const c of categorias) {
      if (!c.slug) continue
      urls.push({ loc: `${base}/categoria/${c.slug}`, path: `/categoria/${c.slug}` })
    }

    for (const p of produtos) {
      if (!p.slug) continue
      urls.push({ loc: `${base}/produto/${p.slug}`, path: `/produto/${p.slug}`, lastmod: p.criadoEm ? new Date(p.criadoEm).toISOString().slice(0, 10) : undefined })
    }
  } catch {
    // sem banco: retorna sitemap mínimo (não quebra com 500)
  }

  const body = urls
    .map((u) => {
      const lastmod = u.lastmod ? `    <lastmod>${escXml(u.lastmod)}</lastmod>\n` : ''

      const alternates = ['pt-BR', 'en', 'es', 'fr', 'de']
        .map((l) => {
          const href = `${getOriginForLang(l)}${u.path}`
          return `    <xhtml:link rel="alternate" hreflang="${escXml(l)}" href="${escXml(href)}"/>\n`
        })
        .join('')

      return (
        `  <url>\n` +
        `    <loc>${escXml(u.loc)}</loc>\n` +
        alternates +
        lastmod +
        `  </url>\n`
      )
    })
    .join('')

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    body +
    `</urlset>\n`
  )
})
