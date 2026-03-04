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
  const { public: publicConfig } = useRuntimeConfig()
  const configuredBase = String((publicConfig as any)?.siteUrl || '').trim().replace(/\/$/, '')
  const requestBase = String(reqUrl.origin || '').trim().replace(/\/$/, '')
  let base = requestBase || configuredBase
  try {
    const reqHost = requestBase ? new URL(requestBase).host : ''
    const cfgHost = configuredBase ? new URL(configuredBase).host : ''
    if (reqHost && cfgHost && reqHost === cfgHost) {
      base = configuredBase
    }
  } catch {
    // ignore invalid URL parsing and keep best-effort base
  }

  const localePrefixes = [
    { code: 'en', prefix: '' },
    { code: 'pt', prefix: '/pt' },
    { code: 'es', prefix: '/es' }
  ]

  const urls: { loc: string; lastmod?: string }[] = []
  for (const l of localePrefixes) {
    urls.push({ loc: `${base}${l.prefix}/`, lastmod: new Date().toISOString().slice(0, 10) })
    urls.push({ loc: `${base}${l.prefix}/produtos/` })
  }

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
      for (const l of localePrefixes) {
        urls.push({ loc: `${base}${l.prefix}/categoria/${c.slug}/` })
      }
    }

    for (const p of produtos) {
      if (!p.slug) continue
      for (const l of localePrefixes) {
        urls.push({
          loc: `${base}${l.prefix}/produto/${p.slug}/`,
          lastmod: p.criadoEm ? new Date(p.criadoEm).toISOString().slice(0, 10) : undefined
        })
      }
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
