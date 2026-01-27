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

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')

  const base = 'https://casadosoftware.com.br'

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

  const urls: { loc: string; lastmod?: string }[] = []

  urls.push({ loc: `${base}/`, lastmod: new Date().toISOString().slice(0, 10) })
  urls.push({ loc: `${base}/produtos` })

  for (const c of categorias) {
    if (!c.slug) continue
    urls.push({ loc: `${base}/categoria/${c.slug}` })
  }

  for (const p of produtos) {
    if (!p.slug) continue
    urls.push({ loc: `${base}/produto/${p.slug}`, lastmod: p.criadoEm ? new Date(p.criadoEm).toISOString().slice(0, 10) : undefined })
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
