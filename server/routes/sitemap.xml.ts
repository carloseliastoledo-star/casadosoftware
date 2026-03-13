import { defineEventHandler, setHeader } from 'h3'
import prisma from '#root/server/db/prisma'

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
  if (h.startsWith('it.')) return 'it'
  if (h.startsWith('fr.')) return 'fr'
  if (h.startsWith('de.')) return 'de'
  return 'pt-BR'
}

function getOriginForLang(lang: string) {
  if (lang === 'en') return 'https://en.casadosoftware.com.br'
  if (lang === 'es') return 'https://es.casadosoftware.com.br'
  if (lang === 'it') return 'https://it.casadosoftware.com.br'
  if (lang === 'fr') return 'https://fr.casadosoftware.com.br'
  if (lang === 'de') return 'https://de.casadosoftware.com.br'
  return 'https://casadosoftware.com.br'
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Cache-Control', 'no-store, max-age=0')
  setHeader(event, 'CDN-Cache-Control', 'no-store')

  const base = 'https://casadosoftware.com.br'

  let products: Array<{ slug: string; criadoEm: Date | null }> = []
  let posts: Array<{ slug: string; atualizadoEm: Date | null }> = []

  try {
    const [productsDb, postsDb] = await Promise.all([
      prisma.produto.findMany({ where: { ativo: true }, select: { slug: true, criadoEm: true } }),
      (prisma as any).blogPost.findMany({ where: { publicado: true }, select: { slug: true, atualizadoEm: true } })
    ])

    products = (productsDb || []) as any
    posts = (postsDb || []) as any
  } catch {
    products = []
    posts = []
  }

  const urls: string[] = []
  urls.push(`<url><loc>${escXml(base)}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`)
  urls.push(`<url><loc>${escXml(base + '/blog')}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`)

  for (const p of products || []) {
    if (!p?.slug) continue
    const lastmod = p.criadoEm ? new Date(p.criadoEm).toISOString() : ''
    urls.push(`<url><loc>${escXml(base + '/produto/' + p.slug)}</loc>${lastmod ? `<lastmod>${escXml(lastmod)}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.9</priority></url>`)
  }

  for (const post of posts || []) {
    const slug = String((post as any)?.slug || '').trim()
    if (!slug) continue
    const last = (post as any)?.atualizadoEm
    const lastmod = last ? new Date(last).toISOString() : ''
    urls.push(`<url><loc>${escXml(base + '/blog/' + slug)}</loc>${lastmod ? `<lastmod>${escXml(lastmod)}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.7</priority></url>`)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('')}\n</urlset>`
  return xml

  /*
  const reqUrl = getRequestURL(event)
  const base = String(reqUrl.origin || '').replace(/\/$/, '')
  const lang = getLangFromHost(String(reqUrl.hostname || ''))

  const urls: { loc: string; path: string; lastmod?: string }[] = []
  urls.push({ loc: `${base}/`, path: '/', lastmod: new Date().toISOString().slice(0, 10) })

  const productsIndexPath =
    lang === 'en' ? '/products' :
      lang === 'es' ? '/productos' :
        lang === 'it' ? '/prodotti' :
        lang === 'fr' ? '/produits' :
          lang === 'de' ? '/produkte' :
            '/produtos'
  urls.push({ loc: `${base}${productsIndexPath}`, path: productsIndexPath })

  urls.push({ loc: `${base}/blog`, path: '/blog' })

  try {
    const { default: prisma } = await import('#root/server/db/prisma')

    const [produtos, categorias, blogPosts] = await Promise.all([
      prisma.produto.findMany({
        where: { ativo: true },
        select: { slug: true, criadoEm: true },
        orderBy: { criadoEm: 'desc' }
      }),
      prisma.categoria.findMany({
        select: { slug: true }
      }),
      (prisma as any).blogPost.findMany({
        where: { publicado: true },
        select: { slug: true, atualizadoEm: true },
        orderBy: { atualizadoEm: 'desc' }
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

    for (const b of blogPosts || []) {
      const slug = String((b as any)?.slug || '').trim()
      if (!slug) continue
      const last = (b as any)?.atualizadoEm
      urls.push({
        loc: `${base}/blog/${slug}`,
        path: `/blog/${slug}`,
        lastmod: last ? new Date(last).toISOString().slice(0, 10) : undefined
      })
    }
  } catch {
    // sem banco: retorna sitemap mínimo (não quebra com 500)
  }

  const body = urls
    .map((u) => {
      const lastmod = u.lastmod ? `    <lastmod>${escXml(u.lastmod)}</lastmod>\n` : ''

      const alternates = ['pt-BR', 'en', 'es', 'it', 'fr', 'de', 'x-default']
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

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    body +
    `</urlset>\n`

  return send(event, xml)
  */
})
