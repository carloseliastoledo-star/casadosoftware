import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../db/prisma'
import { requireAdminSession } from '../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext()

  const body = await readBody(event)

  const headHtml = body?.headHtml === null || body?.headHtml === undefined
    ? null
    : String(body.headHtml)

  const bodyOpenHtml = body?.bodyOpenHtml === null || body?.bodyOpenHtml === undefined
    ? null
    : String(body.bodyOpenHtml)

  const bodyCloseHtml = body?.bodyCloseHtml === null || body?.bodyCloseHtml === undefined
    ? null
    : String(body.bodyCloseHtml)

  const googleAnalyticsId = body?.googleAnalyticsId === null || body?.googleAnalyticsId === undefined
    ? null
    : String(body.googleAnalyticsId).trim()

  const googleAdsConversionId = body?.googleAdsConversionId === null || body?.googleAdsConversionId === undefined
    ? null
    : String(body.googleAdsConversionId).trim()

  const googleAdsConversionLabel = body?.googleAdsConversionLabel === null || body?.googleAdsConversionLabel === undefined
    ? null
    : String(body.googleAdsConversionLabel).trim()

  const homeBestSellerSlugs = body?.homeBestSellerSlugs === null || body?.homeBestSellerSlugs === undefined
    ? null
    : String(body.homeBestSellerSlugs)

  if (googleAdsConversionId && googleAdsConversionId.length > 64) {
    throw createError({ statusCode: 400, statusMessage: 'googleAdsConversionId inválido' })
  }

  if (googleAnalyticsId && googleAnalyticsId.length > 64) {
    throw createError({ statusCode: 400, statusMessage: 'googleAnalyticsId inválido' })
  }

  if (googleAdsConversionLabel && googleAdsConversionLabel.length > 64) {
    throw createError({ statusCode: 400, statusMessage: 'googleAdsConversionLabel inválido' })
  }

  if (headHtml && headHtml.length > 20000) {
    throw createError({ statusCode: 400, statusMessage: 'headHtml muito grande' })
  }

  if (bodyOpenHtml && bodyOpenHtml.length > 20000) {
    throw createError({ statusCode: 400, statusMessage: 'bodyOpenHtml muito grande' })
  }

  if (bodyCloseHtml && bodyCloseHtml.length > 20000) {
    throw createError({ statusCode: 400, statusMessage: 'bodyCloseHtml muito grande' })
  }

  if (homeBestSellerSlugs && homeBestSellerSlugs.length > 20000) {
    throw createError({ statusCode: 400, statusMessage: 'homeBestSellerSlugs muito grande' })
  }

  if (!storeSlug) {
    const existing = await prisma.siteSettings.findFirst({
      select: { id: true }
    })

    const settings = existing
      ? await prisma.siteSettings.update({
          where: { id: existing.id },
          data: {
            googleAnalyticsId: googleAnalyticsId || null,
            googleAdsConversionId: googleAdsConversionId || null,
            googleAdsConversionLabel: googleAdsConversionLabel || null,
            headHtml,
            bodyOpenHtml,
            bodyCloseHtml,
            homeBestSellerSlugs
          },
          select: {
            id: true,
            googleAnalyticsId: true,
            googleAdsConversionId: true,
            googleAdsConversionLabel: true,
            headHtml: true,
            bodyOpenHtml: true,
            bodyCloseHtml: true,
            homeBestSellerSlugs: true
          }
        })
      : await prisma.siteSettings.create({
          data: {
            googleAnalyticsId: googleAnalyticsId || null,
            googleAdsConversionId: googleAdsConversionId || null,
            googleAdsConversionLabel: googleAdsConversionLabel || null,
            headHtml,
            bodyOpenHtml,
            bodyCloseHtml,
            homeBestSellerSlugs
          },
          select: {
            id: true,
            googleAnalyticsId: true,
            googleAdsConversionId: true,
            googleAdsConversionLabel: true,
            headHtml: true,
            bodyOpenHtml: true,
            bodyCloseHtml: true,
            homeBestSellerSlugs: true
          }
        })

    return { ok: true, settings }
  }

  const existing = await prisma.siteSettings.findFirst({
    where: { storeSlug },
    select: { id: true }
  })

  const settings = existing
    ? await prisma.siteSettings.update({
        where: { id: existing.id },
        data: {
          googleAnalyticsId: googleAnalyticsId || null,
          googleAdsConversionId: googleAdsConversionId || null,
          googleAdsConversionLabel: googleAdsConversionLabel || null,
          headHtml,
          bodyOpenHtml,
          bodyCloseHtml,
          homeBestSellerSlugs
        },
        select: {
          id: true,
          googleAnalyticsId: true,
          googleAdsConversionId: true,
          googleAdsConversionLabel: true,
          headHtml: true,
          bodyOpenHtml: true,
          bodyCloseHtml: true,
          homeBestSellerSlugs: true
        }
      })
    : await prisma.siteSettings.create({
        data: {
          storeSlug,
          googleAnalyticsId: googleAnalyticsId || null,
          googleAdsConversionId: googleAdsConversionId || null,
          googleAdsConversionLabel: googleAdsConversionLabel || null,
          headHtml,
          bodyOpenHtml,
          bodyCloseHtml,
          homeBestSellerSlugs
        },
        select: {
          id: true,
          googleAnalyticsId: true,
          googleAdsConversionId: true,
          googleAdsConversionLabel: true,
          headHtml: true,
          bodyOpenHtml: true,
          bodyCloseHtml: true,
          homeBestSellerSlugs: true
        }
      })

  return { ok: true, settings }
})
