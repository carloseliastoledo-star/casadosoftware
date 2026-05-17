import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../db/prisma'
import { requireAdminSession } from '../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)
  console.log('[api/admin/settings.put] storeSlug:', storeSlug)

  const prismaAny = prisma as any

  const body = await readBody(event)
  console.log('[api/admin/settings.put] body keys:', Object.keys(body || {}))

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

  const googleAdsConfigJson = body?.googleAdsConfigJson === null || body?.googleAdsConfigJson === undefined
    ? null
    : String(body.googleAdsConfigJson)

  const metaPixelId = body?.metaPixelId === null || body?.metaPixelId === undefined
    ? null
    : String(body.metaPixelId).trim()

  const tiktokPixelId = body?.tiktokPixelId === null || body?.tiktokPixelId === undefined
    ? null
    : String(body.tiktokPixelId).trim()

  const homeBestSellerSlugs = body?.homeBestSellerSlugs === null || body?.homeBestSellerSlugs === undefined
    ? null
    : String(body.homeBestSellerSlugs)

  const homeVideoUrl = body?.homeVideoUrl === null || body?.homeVideoUrl === undefined
    ? null
    : String(body.homeVideoUrl)

  const footerPolicyLinks = body?.footerPolicyLinks === null || body?.footerPolicyLinks === undefined
    ? null
    : String(body.footerPolicyLinks)

  const rawPixGateway = String(body?.pixGateway || '').trim().toLowerCase()
  const pixGateway = ['pagarme', 'pagbank'].includes(rawPixGateway) ? rawPixGateway : 'mercadopago'

  const rawCardGateway = String(body?.cardGateway || '').trim().toLowerCase()
  const cardGateway = ['pagarme', 'pagbank'].includes(rawCardGateway) ? rawCardGateway : 'mercadopago'

  const orderBumpTitle = body?.orderBumpTitle === null || body?.orderBumpTitle === undefined
    ? null
    : String(body.orderBumpTitle).trim().slice(0, 200) || null

  const orderBumpDescription = body?.orderBumpDescription === null || body?.orderBumpDescription === undefined
    ? null
    : String(body.orderBumpDescription).trim().slice(0, 1000) || null

  const orderBumpPrice = body?.orderBumpPrice === null || body?.orderBumpPrice === undefined || body?.orderBumpPrice === ''
    ? null
    : Math.max(0, Number(body.orderBumpPrice) || 0) || null

  const rawOrderBumps = Array.isArray(body?.orderBumps) ? body.orderBumps : []
  const orderBumps = rawOrderBumps
    .map((item: any) => ({
      id: String(item?.id || '').trim().slice(0, 80),
      title: String(item?.title || '').trim().slice(0, 200),
      description: String(item?.description || '').trim().slice(0, 1000),
      price: Math.max(0, Number(item?.price) || 0),
      active: item?.active !== false
    }))
    .filter((item: any) => item.title && item.price > 0)
    .slice(0, 10)
    .map((item: any, index: number) => ({
      ...item,
      id: item.id || `bump-${index + 1}`
    }))

  const orderBumpsJson = orderBumps.length ? JSON.stringify(orderBumps) : null

  if (googleAdsConversionId && googleAdsConversionId.length > 64) {
    throw createError({ statusCode: 400, statusMessage: 'googleAdsConversionId inválido' })
  }

  if (googleAnalyticsId && googleAnalyticsId.length > 64) {
    throw createError({ statusCode: 400, statusMessage: 'googleAnalyticsId inválido' })
  }

  if (googleAdsConversionLabel && googleAdsConversionLabel.length > 64) {
    throw createError({ statusCode: 400, statusMessage: 'googleAdsConversionLabel inválido' })
  }

  if (metaPixelId && metaPixelId.length > 64) {
    throw createError({ statusCode: 400, statusMessage: 'metaPixelId inválido' })
  }

  if (tiktokPixelId && tiktokPixelId.length > 64) {
    throw createError({ statusCode: 400, statusMessage: 'tiktokPixelId inválido' })
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

  if (homeVideoUrl && homeVideoUrl.length > 20000) {
    throw createError({ statusCode: 400, statusMessage: 'homeVideoUrl muito grande' })
  }

  if (footerPolicyLinks && footerPolicyLinks.length > 20000) {
    throw createError({ statusCode: 400, statusMessage: 'footerPolicyLinks muito grande' })
  }

  if (googleAdsConfigJson && googleAdsConfigJson.length > 50000) {
    throw createError({ statusCode: 400, statusMessage: 'googleAdsConfigJson muito grande' })
  }

  if (googleAdsConfigJson) {
    try {
      JSON.parse(googleAdsConfigJson)
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'googleAdsConfigJson inválido (JSON inválido)' })
    }
  }

  if (!storeSlug) {
    const existing = await prismaAny.siteSettings.findFirst({
      select: { id: true }
    })

    const settings = existing
      ? await prismaAny.siteSettings.update({
          where: { id: existing.id },
          data: {
            googleAnalyticsId: googleAnalyticsId || null,
            googleAdsConversionId: googleAdsConversionId || null,
            googleAdsConversionLabel: googleAdsConversionLabel || null,
            googleAdsConfigJson: googleAdsConfigJson || null,
            metaPixelId: metaPixelId || null,
            tiktokPixelId: tiktokPixelId || null,
            headHtml,
            bodyOpenHtml,
            bodyCloseHtml,
            homeBestSellerSlugs,
            homeVideoUrl,
            footerPolicyLinks,
            pixGateway,
            cardGateway,
            orderBumpTitle,
            orderBumpDescription,
            orderBumpPrice,
            orderBumpsJson
          },
          select: {
            id: true,
            googleAnalyticsId: true,
            googleAdsConversionId: true,
            googleAdsConversionLabel: true,
            googleAdsConfigJson: true,
            metaPixelId: true,
            tiktokPixelId: true,
            headHtml: true,
            bodyOpenHtml: true,
            bodyCloseHtml: true,
            homeBestSellerSlugs: true,
            homeVideoUrl: true,
            footerPolicyLinks: true,
            pixGateway: true,
            cardGateway: true,
            orderBumpTitle: true,
            orderBumpDescription: true,
            orderBumpPrice: true,
            orderBumpsJson: true
          }
        })
      : await prismaAny.siteSettings.create({
          data: {
            googleAnalyticsId: googleAnalyticsId || null,
            googleAdsConversionId: googleAdsConversionId || null,
            googleAdsConversionLabel: googleAdsConversionLabel || null,
            googleAdsConfigJson: googleAdsConfigJson || null,
            metaPixelId: metaPixelId || null,
            tiktokPixelId: tiktokPixelId || null,
            headHtml,
            bodyOpenHtml,
            bodyCloseHtml,
            homeBestSellerSlugs,
            homeVideoUrl,
            footerPolicyLinks,
            pixGateway,
            cardGateway,
            orderBumpTitle,
            orderBumpDescription,
            orderBumpPrice,
            orderBumpsJson
          },
          select: {
            id: true,
            googleAnalyticsId: true,
            googleAdsConversionId: true,
            googleAdsConversionLabel: true,
            googleAdsConfigJson: true,
            metaPixelId: true,
            tiktokPixelId: true,
            headHtml: true,
            bodyOpenHtml: true,
            bodyCloseHtml: true,
            homeBestSellerSlugs: true,
            homeVideoUrl: true,
            footerPolicyLinks: true,
            pixGateway: true,
            cardGateway: true,
            orderBumpTitle: true,
            orderBumpDescription: true,
            orderBumpPrice: true,
            orderBumpsJson: true
          }
        })

    return { ok: true, settings }
  }

  const existing = await prismaAny.siteSettings.findFirst({
    where: { storeSlug },
    select: { id: true }
  })

  console.log('[api/admin/settings.put] existing:', existing)

  try {
    const settings = existing
      ? await prismaAny.siteSettings.update({
          where: { id: existing.id },
          data: {
            googleAnalyticsId: googleAnalyticsId || null,
            googleAdsConversionId: googleAdsConversionId || null,
            googleAdsConversionLabel: googleAdsConversionLabel || null,
            googleAdsConfigJson: googleAdsConfigJson || null,
            metaPixelId: metaPixelId || null,
            tiktokPixelId: tiktokPixelId || null,
            headHtml,
            bodyOpenHtml,
            bodyCloseHtml,
            homeBestSellerSlugs,
            homeVideoUrl,
            footerPolicyLinks,
            pixGateway,
            cardGateway,
            orderBumpTitle,
            orderBumpDescription,
            orderBumpPrice,
            orderBumpsJson,
            updatedAt: new Date()
          },
        select: {
          id: true,
          googleAnalyticsId: true,
          googleAdsConversionId: true,
          googleAdsConversionLabel: true,
          googleAdsConfigJson: true,
          metaPixelId: true,
          tiktokPixelId: true,
          headHtml: true,
          bodyOpenHtml: true,
          bodyCloseHtml: true,
          homeBestSellerSlugs: true,
          homeVideoUrl: true,
          footerPolicyLinks: true,
          pixGateway: true,
          cardGateway: true,
          orderBumpTitle: true,
          orderBumpDescription: true,
          orderBumpPrice: true,
          orderBumpsJson: true
        }
      })
    : await prismaAny.siteSettings.create({
        data: {
          id: crypto.randomUUID(),
          storeSlug,
          googleAnalyticsId: googleAnalyticsId || null,
          googleAdsConversionId: googleAdsConversionId || null,
          googleAdsConversionLabel: googleAdsConversionLabel || null,
          googleAdsConfigJson: googleAdsConfigJson || null,
          metaPixelId: metaPixelId || null,
          tiktokPixelId: tiktokPixelId || null,
          headHtml,
          bodyOpenHtml,
          bodyCloseHtml,
          homeBestSellerSlugs,
          homeVideoUrl,
          footerPolicyLinks,
          pixGateway,
          cardGateway,
          orderBumpTitle,
          orderBumpDescription,
          orderBumpPrice,
          orderBumpsJson,
          updatedAt: new Date()
        },
        select: {
          id: true,
          googleAnalyticsId: true,
          googleAdsConversionId: true,
          googleAdsConversionLabel: true,
          googleAdsConfigJson: true,
          metaPixelId: true,
          tiktokPixelId: true,
          headHtml: true,
          bodyOpenHtml: true,
          bodyCloseHtml: true,
          homeBestSellerSlugs: true,
          homeVideoUrl: true,
          footerPolicyLinks: true,
          pixGateway: true,
          cardGateway: true,
          orderBumpTitle: true,
          orderBumpDescription: true,
          orderBumpPrice: true,
          orderBumpsJson: true
        }
      })

    return { ok: true, settings }
  } catch (error: any) {
    console.error('[api/admin/settings.put] Error:', error)
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Erro ao salvar configurações' })
  }
})



