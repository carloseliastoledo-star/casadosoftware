import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const slug = String(q.slug || '').trim()
  const locale = String(q.locale || 'pt').trim()
  const preview = String(q.preview || '').trim()

  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug obrigatório' })

  const page = await (prisma as any).seoPage.findUnique({
    where: { locale_slug: { locale, slug } }
  })

  if (!page) throw createError({ statusCode: 404, statusMessage: 'Página não encontrada' })

  const isPreview = preview === (process.env.SEO_PAGE_PREVIEW_TOKEN || '')
    && Boolean(process.env.SEO_PAGE_PREVIEW_TOKEN)

  if (page.status !== 'published' && !isPreview) {
    throw createError({ statusCode: 404, statusMessage: 'Página não publicada' })
  }

  return { ok: true, page }
})
