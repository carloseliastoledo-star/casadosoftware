import { defineEventHandler, readBody, createError } from 'h3'
import { randomUUID } from 'node:crypto'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'
import { decodeHtmlEntities } from '../../../utils/decodeHtmlEntities.js'
import { getStoreContext } from '../../../utils/store.js'

function stripScripts(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, '')
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)
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
  const excerptRaw = body?.excerpt != null ? String(body.excerpt).trim() : ''
  const excerpt = excerptRaw || null
  const seoTitleRaw = body?.seoTitle != null ? String(body.seoTitle).trim() : ''
  const seoTitle = seoTitleRaw || null
  const seoDescriptionRaw = body?.seoDescription != null ? String(body.seoDescription).trim() : ''
  const seoDescription = seoDescriptionRaw || null

  // Status: draft | scheduled | published
  const statusRaw = String(body?.status || '').trim()
  const now = new Date()
  let status = 'draft'
  let scheduledAt: Date | null = null
  let publishedAt: Date | null = null

  if (statusRaw === 'published' || publicado) {
    status = 'published'
    publishedAt = now
  } else if (statusRaw === 'scheduled' && body?.scheduledAt) {
    const d = new Date(body.scheduledAt)
    if (!isNaN(d.getTime())) {
      status = 'scheduled'
      scheduledAt = d
    }
  }

  if (!titulo) throw createError({ statusCode: 400, statusMessage: 'Título obrigatório' })
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug obrigatório' })
  if (status !== 'draft' && !htmlRaw?.trim()) throw createError({ statusCode: 400, statusMessage: 'Conteúdo obrigatório para publicar' })

  const decodedHtmlRaw = htmlRaw ? decodeHtmlEntities(htmlRaw) : ''
  const html = decodedHtmlRaw ? stripScripts(decodedHtmlRaw) : null
  console.log(`[blog/post] html len=${String(html || '').length}`)

  try {
    const post = await (prisma as any).blogPost.create({
      data: {
        id: randomUUID(),
        titulo,
        slug,
        storeSlug,
        featuredImage,
        imageAlt,
        imageTitle,
        imageCaption,
        excerpt,
        html,
        publicado: status === 'published',
        status,
        scheduledAt,
        publishedAt,
        seoTitle,
        seoDescription,
        atualizadoEm: now
      },
      select: {
        id: true,
        titulo: true,
        slug: true,
        featuredImage: true,
        imageAlt: true,
        imageTitle: true,
        imageCaption: true,
        excerpt: true,
        html: true,
        publicado: true,
        status: true,
        scheduledAt: true,
        publishedAt: true,
        seoTitle: true,
        seoDescription: true,
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
