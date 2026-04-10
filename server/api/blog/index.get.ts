import { defineEventHandler, createError } from 'h3'
import prisma from '../../db/prisma.js'
import { decodeHtmlEntities } from '../../utils/decodeHtmlEntities.js'
import { getIntlContext } from '../../utils/intl'
import { autoTranslateText } from '../../utils/autoTranslate'

function firstImageFromHtml(html: unknown): string | null {
  const raw = String(html ?? '')
  if (!raw) return null

  const match = raw.match(/<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i)
  const src = (match?.[1] || match?.[2] || match?.[3] || '').trim()
  if (!src) return null
  return src
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

function excerptFromHtml(html: unknown, maxLen = 160): string {
  const decoded = decodeHtmlEntities(html)
  const txt = stripHtml(decoded)
  if (!txt) return ''
  if (txt.length <= maxLen) return txt
  return `${txt.slice(0, maxLen).trimEnd()}…`
}

export default defineEventHandler(async (event) => {
  try {
    const posts = await (prisma as any).blogPost.findMany({
      where: { publicado: true },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        titulo: true,
        slug: true,
        featuredImage: true,
        excerpt: true,
        keyword: true,
        html: true,
        criadoEm: true,
        atualizadoEm: true,
        translations: {
          select: {
            lang: true,
            titulo: true,
            featuredImage: true,
            excerpt: true,
            html: true
          }
        }
      }
    })

    const lang = String(getIntlContext(event).language || 'pt')

    const normalized = Array.isArray(posts)
      ? posts.map((p: any) => {
          const translation = Array.isArray(p?.translations)
            ? p.translations.find((t: any) => String(t?.lang || '').toLowerCase() === lang)
            : null

          const rawTitulo = translation?.titulo || p?.titulo || ''
          const titulo = (lang !== 'pt' && !translation)
            ? (autoTranslateText(rawTitulo, { lang: lang as any }) || rawTitulo)
            : rawTitulo

          const rawExcerpt = translation?.excerpt || p?.excerpt ||
            excerptFromHtml(translation?.html || p?.html)
          const descricao = (lang !== 'pt' && !translation)
            ? (autoTranslateText(rawExcerpt, { lang: lang as any }) || rawExcerpt)
            : rawExcerpt

          return {
            titulo,
            slug: p?.slug,
            keyword: p?.keyword,
            featuredImage:
              translation?.featuredImage ||
              p?.featuredImage ||
              firstImageFromHtml(decodeHtmlEntities(translation?.html || p?.html)) ||
              null,
            descricao,
            criadoEm: p?.criadoEm,
            atualizadoEm: p?.atualizadoEm
          }
        })
      : []

    return { ok: true, posts: normalized }
  } catch (err: any) {
    const message = String(err?.message || '')
    const code = String(err?.code || '')

    if (code === 'P2021' || message.includes('does not exist') || message.includes("doesn't exist")) {
      return { ok: true, posts: [] }
    }

    console.error('[api][blog][index] db error', err?.message || err)
    throw createError({ statusCode: 503, statusMessage: 'Serviço temporariamente indisponível' })
  }
})
