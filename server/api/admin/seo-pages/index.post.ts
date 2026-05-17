import { defineEventHandler, readBody, createError } from 'h3'
import { randomUUID } from 'node:crypto'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '../../../utils/store'
import { Prisma } from '@prisma/client'

function sanitizeSlug(raw: string) {
  return raw
    .toLowerCase()
    .replace(/^\/+/, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const ctx = getStoreContext(event)
  const storeSlug = ctx.storeSlug || 'casadosoftware'

  const body = await readBody(event)

  const locale = String(body?.locale || '').trim()
  const slug = sanitizeSlug(String(body?.slug || '').trim())
  const title = String(body?.title || '').trim()
  const seoTitle = String(body?.seoTitle || '').trim() || null
  const seoDescription = String(body?.seoDescription || '').trim() || null
  const h1 = String(body?.h1 || '').trim() || null
  const heroBadge = String(body?.heroBadge || '').trim() || null
  const heroDescription = String(body?.heroDescription || '').trim() || null
  const contentHtml = body?.contentHtml != null ? String(body.contentHtml) : null
  const faqJson = body?.faqJson != null ? String(body.faqJson) : null
  const linkedProductSlug = String(body?.linkedProductSlug || '').trim() || null
  const linkedCategorySlug = String(body?.linkedCategorySlug || '').trim() || null
  const templateKey = String(body?.templateKey || 'default-money-page').trim()
  const status = body?.status === 'published' ? 'published' : 'draft'
  const noindex = Boolean(body?.noindex)

  if (!locale || !['pt', 'en', 'es', 'fr', 'it'].includes(locale))
    throw createError({ statusCode: 400, statusMessage: 'locale inválido' })
  if (!slug || slug.length < 2)
    throw createError({ statusCode: 400, statusMessage: 'Slug inválido (mín. 2 caracteres)' })
  if (!title)
    throw createError({ statusCode: 400, statusMessage: 'Título obrigatório' })

  if (status === 'published') {
    if (!h1) throw createError({ statusCode: 400, statusMessage: 'h1 obrigatório para publicar' })
    if (!seoDescription) throw createError({ statusCode: 400, statusMessage: 'SEO description obrigatória para publicar' })
  }

  try {
    const faqParsed = faqJson ? JSON.parse(faqJson) : null
    const faqStored = faqParsed ? JSON.stringify(faqParsed) : null

    const page = await (prisma as any).seoPage.create({
      data: {
        id: randomUUID(),
        storeSlug,
        locale,
        slug,
        title,
        seoTitle,
        seoDescription,
        h1,
        heroBadge,
        heroDescription,
        contentHtml,
        faqJson: faqStored,
        linkedProductSlug,
        linkedCategorySlug,
        templateKey,
        status,
        noindex,
        publishedAt: status === 'published' ? new Date() : null,
        updatedAt: new Date()
      }
    })

    return { ok: true, page }
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw createError({ statusCode: 400, statusMessage: `Já existe uma página com slug "${slug}" para locale "${locale}"` })
    }
    throw createError({ statusCode: 500, statusMessage: err?.message || 'Erro interno ao salvar SEO Page' })
  }
})
