import { defineEventHandler, setHeader, getRequestURL } from 'h3'

function escXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')

  const reqUrl = getRequestURL(event)
  const base = String(reqUrl.origin || '').trim().replace(/\/$/, '')

  const urls: { loc: string; lastmod?: string }[] = []
  urls.push({ loc: `${base}/`, lastmod: new Date().toISOString().slice(0, 10) })
  urls.push({ loc: `${base}/produtos` })

  try {
    const { default: prisma } = await import('#root/server/db/prisma')

    const [produtos, categorias] = await Promise.all([
      prisma.produto.findMany({
        where: { ativo: true },
        select: { slug: true, criadoEm: true },
        orderBy: { criadoEm: 'desc' }
      }),
      prisma.categoria.findMany({
        where: { ativo: true },
        select: { slug: true }
      })
    ])

    for (const c of categorias) {
      if (!c.slug) continue
      urls.push({ loc: `${base}/categoria/${c.slug}` })
    }

    for (const p of produtos) {
      if (!p.slug) continue
      urls.push({ loc: `${base}/produto/${p.slug}`, lastmod: p.criadoEm ? new Date(p.criadoEm).toISOString().slice(0, 10) : undefined })
    }
  } catch {
    // sem banco: retorna sitemap mínimo (não quebra com 500)
  }

  const body = urls
    .map((u) => {
      const lastmod = u.lastmod ? `<lastmod>${escXml(u.lastmod)}</lastmod>` : ''
      return `<url><loc>${escXml(u.loc)}</loc>${lastmod}</url>`
    })
    .join('')

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    body +
    `</urlset>`
  )
})
