import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../../../db/prisma.js'
import { requireAdminSession } from '../../../../../utils/adminSession.js'
import { decodeHtmlEntities } from '../../../../../utils/decodeHtmlEntities.js'
import { sanitizeRichHtml } from '../../../../../utils/sanitizeRichHtml'

function normalizeLang(input: unknown): string {
  return String(input || '').trim().toLowerCase()
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const postId = String(event.context.params?.id || '')
  const lang = normalizeLang(event.context.params?.lang)
  if (!postId) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  if (!lang) throw createError({ statusCode: 400, statusMessage: 'lang obrigatório' })

  const body = await readBody(event)

  const titulo = String(body?.titulo || '').trim()
  const featuredImageRaw = body?.featuredImage != null ? String(body.featuredImage).trim() : ''
  const featuredImage = featuredImageRaw ? featuredImageRaw : null
  const excerptRaw = body?.excerpt != null ? String(body.excerpt).trim() : ''
  const excerpt = excerptRaw ? excerptRaw : null
  const htmlRaw = body?.html != null ? String(body.html) : null

  if (!titulo) throw createError({ statusCode: 400, statusMessage: 'Título obrigatório' })

  const decodedHtmlRaw = htmlRaw ? decodeHtmlEntities(htmlRaw) : ''
  const html = decodedHtmlRaw ? sanitizeRichHtml(decodedHtmlRaw, { allowIframes: true }) : null

  try {
    const existing = await (prisma as any).blogPostTranslation.findFirst({
      where: { postId, lang },
      select: { id: true }
    })

    const translation = existing
      ? await (prisma as any).blogPostTranslation.update({
          where: { id: existing.id },
          data: { titulo, featuredImage, excerpt, html },
          select: {
            id: true,
            postId: true,
            lang: true,
            titulo: true,
            featuredImage: true,
            excerpt: true,
            html: true,
            criadoEm: true,
            atualizadoEm: true
          }
        })
      : await (prisma as any).blogPostTranslation.create({
          data: { postId, lang, titulo, featuredImage, excerpt, html },
          select: {
            id: true,
            postId: true,
            lang: true,
            titulo: true,
            featuredImage: true,
            excerpt: true,
            html: true,
            criadoEm: true,
            atualizadoEm: true
          }
        })

    return { ok: true, translation }
  } catch (err: any) {
    const message = String(err?.message || '')
    const code = String(err?.code || '')

    if (code === 'P2021' || message.includes('does not exist') || message.includes("doesn't exist")) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Banco de dados desatualizado (migração pendente). Rode as migrations em produção.'
      })
    }

    if (code === 'P2003' || message.includes('Foreign key constraint')) {
      throw createError({ statusCode: 404, statusMessage: 'Post não encontrado' })
    }

    throw err
  }
})
