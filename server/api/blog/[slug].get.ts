import { defineEventHandler, createError } from 'h3'
import prisma from '../../db/prisma.js'
import { decodeHtmlEntities } from '../../utils/decodeHtmlEntities.js'
import { getIntlContext } from '../../utils/intl'
import { autoTranslateText } from '../../utils/autoTranslate'

export default defineEventHandler(async (event) => {
  const slug = String(event.context.params?.slug || '').trim()
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug obrigatório' })

  let post: any = null
  try {
    post = await (prisma as any).blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        titulo: true,
        slug: true,
        featuredImage: true,
        excerpt: true,
        keyword: true,
        html: true,
        publicado: true,
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
  } catch (err: any) {
    const message = String(err?.message || '')
    const code = String(err?.code || '')

    if (code === 'P2021' || message.includes('does not exist') || message.includes("doesn't exist")) {
      throw createError({ statusCode: 404, statusMessage: 'Post não encontrado' })
    }

    throw err
  }

  if (!post || !post.publicado) {
    throw createError({ statusCode: 404, statusMessage: 'Post não encontrado' })
  }

  const lang = String(getIntlContext(event).language || 'pt')
  const tr = Array.isArray(post?.translations)
    ? post.translations.find((t: any) => String(t?.lang || '').toLowerCase() === lang)
    : null

  const rawTitulo = tr?.titulo || post?.titulo || ''
  const rawExcerpt = tr?.excerpt || post?.excerpt || null

  const normalized: any = {
    titulo: (lang !== 'pt' && !tr)
      ? (autoTranslateText(rawTitulo, { lang: lang as any }) || rawTitulo)
      : rawTitulo,
    slug: post?.slug,
    featuredImage: tr?.featuredImage || post?.featuredImage || null,
    excerpt: (lang !== 'pt' && !tr && rawExcerpt)
      ? (autoTranslateText(rawExcerpt, { lang: lang as any }) || rawExcerpt)
      : rawExcerpt,
    keyword: post?.keyword || null,
    html: (() => {
      const rawHtml = tr?.html || post?.html || null
      if (!rawHtml || lang === 'pt' || tr?.html) return rawHtml
      // Translate only text nodes (between > and <), preserving HTML structure
      return rawHtml.replace(/>([^<]+)</g, (_m: string, text: string) => {
        const translated = autoTranslateText(text, { lang: lang as any })
        return '>' + translated + '<'
      })
    })(),
    criadoEm: post?.criadoEm,
    atualizadoEm: post?.atualizadoEm
  }

  if (normalized?.html) {
    normalized.html = decodeHtmlEntities(normalized.html)
  }

  return { ok: true, post: normalized }
})
