import { defineEventHandler, getRequestURL, send, setHeader } from 'h3'
import prisma from '../db/prisma'
import { decodeHtmlEntities } from '../utils/decodeHtmlEntities'
import { getIntlContext } from '../utils/intl'

function escXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(input: unknown): string {
  const raw = String(input ?? '')
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function excerptFromHtml(html: unknown, maxLen = 240): string {
  const decoded = decodeHtmlEntities(html)
  const txt = stripHtml(decoded)
  if (!txt) return ''
  if (txt.length <= maxLen) return txt
  return `${txt.slice(0, maxLen).trimEnd()}…`
}

function toAbsoluteUrl(origin: string, url: string): string {
  const u = String(url || '').trim()
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  const o = String(origin || '').replace(/\/+$/, '')
  const p = u.startsWith('/') ? u : `/${u}`
  return `${o}${p}`
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Cache-Control', 'no-store, max-age=0')
  setHeader(event, 'CDN-Cache-Control', 'no-store')

  const reqUrl = getRequestURL(event)
  const origin = (String(process.env.SITE_URL || '').trim() || String(reqUrl.origin || '')).replace(/\/+$/, '')
  const lang = String(getIntlContext(event).language || 'pt').toLowerCase()

  const channelTitle = lang === 'en' ? 'Casa do Software Blog' : 'Blog - Casa do Software'
  const channelLink = `${origin}/blog`
  const channelDescription =
    lang === 'en'
      ? 'Tutorials, guides, and tips for Windows and Office activation.'
      : 'Tutoriais, guias e dicas para ativação do Windows e Office.'

  let itemsXml = ''
  let channelLastBuildDate = ''

  try {
    const posts = await (prisma as any).blogPost.findMany({
      where: { publicado: true },
      orderBy: { criadoEm: 'desc' },
      take: 50,
      select: {
        id: true,
        slug: true,
        titulo: true,
        excerpt: true,
        html: true,
        criadoEm: true,
        atualizadoEm: true,
        featuredImage: true,
        translations: {
          select: { lang: true, titulo: true, excerpt: true, html: true, featuredImage: true }
        }
      }
    })

    const normalized = Array.isArray(posts)
      ? posts.map((p: any) => {
          const tr = Array.isArray(p?.translations)
            ? p.translations.find((t: any) => String(t?.lang || '').toLowerCase() === lang)
            : null

          const titulo = tr?.titulo || p?.titulo
          const slug = String(p?.slug || '').trim()
          const html = tr?.html || p?.html
          const excerpt = tr?.excerpt || p?.excerpt || excerptFromHtml(html)
          const criadoEm = p?.criadoEm
          const updatedAt = p?.atualizadoEm
          const featuredImage = tr?.featuredImage || p?.featuredImage

          const link = `${origin}/blog/${slug}`
          const guid = `${origin}/blog/${slug}`
          const pubDate = criadoEm ? new Date(criadoEm).toUTCString() : new Date().toUTCString()

          const updatedMs = updatedAt ? new Date(updatedAt).getTime() : 0

          return {
            titulo,
            slug,
            excerpt,
            html,
            featuredImage,
            link,
            guid,
            pubDate,
            updatedMs
          }
        })
      : []

    const maxUpdatedMs = normalized.reduce((acc: number, p: any) => Math.max(acc, Number(p?.updatedMs || 0)), 0)
    channelLastBuildDate = maxUpdatedMs ? new Date(maxUpdatedMs).toUTCString() : ''

    itemsXml = normalized
      .filter((p: any) => Boolean(p?.slug))
      .map((p: any) => {
        const img = p.featuredImage ? toAbsoluteUrl(origin, String(p.featuredImage)) : ''
        const description = escXml(String(p.excerpt || ''))
        const content = String(decodeHtmlEntities(p.html || ''))

        const media = img
          ? `    <enclosure url="${escXml(img)}" type="image/*" />\n`
          : ''

        return (
          `  <item>\n` +
          `    <title>${escXml(String(p.titulo || ''))}</title>\n` +
          `    <link>${escXml(String(p.link || ''))}</link>\n` +
          `    <guid isPermaLink="true">${escXml(String(p.guid || ''))}</guid>\n` +
          `    <pubDate>${escXml(String(p.pubDate || ''))}</pubDate>\n` +
          `    <description>${description}</description>\n` +
          `    <content:encoded><![CDATA[${content}]]></content:encoded>\n` +
          media +
          `  </item>\n`
        )
      })
      .join('')
  } catch {
    itemsXml = ''
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n` +
    `<channel>\n` +
    `  <title>${escXml(channelTitle)}</title>\n` +
    `  <link>${escXml(channelLink)}</link>\n` +
    `  <description>${escXml(channelDescription)}</description>\n` +
    `  <language>${escXml(lang === 'pt' ? 'pt-BR' : lang)}</language>\n` +
    (channelLastBuildDate ? `  <lastBuildDate>${escXml(channelLastBuildDate)}</lastBuildDate>\n` : '') +
    itemsXml +
    `</channel>\n` +
    `</rss>\n`

  return send(event, xml)
})
