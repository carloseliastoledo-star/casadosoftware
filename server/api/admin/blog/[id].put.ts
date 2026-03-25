import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'
import DOMPurify from 'isomorphic-dompurify'
import { sanitizeRichHtml } from '../../../utils/sanitizeRichHtml'
import { decodeHtmlEntities } from '../../../utils/decodeHtmlEntities.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(event.context.params?.id || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })

  const body = await readBody(event)

  const titulo = String(body?.titulo || '').trim()
  const slug = String(body?.slug || '').trim()
  const featuredImageRaw = body?.featuredImage != null ? String(body.featuredImage).trim() : ''
  const featuredImage = featuredImageRaw ? featuredImageRaw : null
  const htmlRaw = body?.html != null ? String(body.html) : null
  const publicado = Boolean(body?.publicado)

  if (!titulo) throw createError({ statusCode: 400, statusMessage: 'Título obrigatório' })
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug obrigatório' })

  const decodedHtmlRaw = htmlRaw ? decodeHtmlEntities(htmlRaw) : ''
  let html: string | null = null
  if (decodedHtmlRaw) {
    try {
      html = sanitizeRichHtml(decodedHtmlRaw, { allowIframes: true })
      if (!html && decodedHtmlRaw) {
        console.warn('[blog/put] sanitizeRichHtml returned empty, using raw HTML')
        html = decodedHtmlRaw
      }
    } catch (err) {
      console.error('[blog/put] sanitizeRichHtml failed, using raw HTML:', err)
      html = decodedHtmlRaw
    }
  }
  console.log(`[blog/put] html input len=${String(htmlRaw || '').length}, sanitized len=${String(html || '').length}`)

  try {
    const post = await (prisma as any).blogPost.update({
      where: { id },
      data: {
        titulo,
        slug,
        featuredImage,
        html,
        publicado
      },
      select: {
        id: true,
        titulo: true,
        slug: true,
        featuredImage: true,
        html: true,
        publicado: true,
        criadoEm: true,
        atualizadoEm: true
      }
    })

    return { ok: true, post }
  } catch (err: any) {
    const message = String(err?.message || '')
    throw createError({
      statusCode: 500,
      statusMessage: message.includes('Unknown column') || message.includes("doesn't exist")
        ? 'Banco de dados desatualizado (migração pendente). Rode as migrations em produção.'
        : (err?.message || 'Server Error')
    })
  }
})
