import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(event.context.params?.id || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })

  const body = await readBody(event)

  const titulo = String(body?.titulo || '').trim()
  const slug = String(body?.slug || '').trim()
  const featuredImageRaw = body?.featuredImage != null ? String(body.featuredImage).trim() : ''
  const featuredImage = featuredImageRaw ? featuredImageRaw : null
  const imageAltRaw = body?.imageAlt != null ? String(body.imageAlt).trim() : ''
  const imageAlt = imageAltRaw ? imageAltRaw : null
  const imageTitleRaw = body?.imageTitle != null ? String(body.imageTitle).trim() : ''
  const imageTitle = imageTitleRaw ? imageTitleRaw : null
  const imageCaptionRaw = body?.imageCaption != null ? String(body.imageCaption).trim() : ''
  const imageCaption = imageCaptionRaw ? imageCaptionRaw : null
  const htmlRaw = body?.html != null ? String(body.html) : null
  const publicado = Boolean(body?.publicado)

  if (!titulo) throw createError({ statusCode: 400, statusMessage: 'Título obrigatório' })
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug obrigatório' })

  const html = htmlRaw || null
  console.log(`[blog/put] htmlRaw type=${typeof body?.html}, html len=${String(html || '').length}`)

  try {
    const post = await (prisma as any).blogPost.update({
      where: { id },
      data: {
        titulo,
        slug,
        featuredImage,
        imageAlt,
        imageTitle,
        imageCaption,
        html,
        publicado
      },
      select: {
        id: true,
        titulo: true,
        slug: true,
        featuredImage: true,
        imageAlt: true,
        imageTitle: true,
        imageCaption: true,
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
