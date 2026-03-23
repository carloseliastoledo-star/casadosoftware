import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'
import { requireAdminSession } from '../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)

  const prismaAny = prisma as any

  if (!storeSlug) {
    const existing = await prismaAny.siteSettings.findFirst({
      select: {
        id: true,
        googleAnalyticsId: true,
        googleAdsConversionId: true,
        googleAdsConversionLabel: true,
        headHtml: true,
        bodyOpenHtml: true,
        bodyCloseHtml: true,
        homeBestSellerSlugs: true,
        homeVideoUrl: true,
        footerPolicyLinks: true,
        pixGateway: true
      }
    })

    if (existing) return { ok: true, settings: existing }

    const created = await prismaAny.siteSettings.create({
      data: {},
      select: {
        id: true,
        googleAnalyticsId: true,
        googleAdsConversionId: true,
        googleAdsConversionLabel: true,
        headHtml: true,
        bodyOpenHtml: true,
        bodyCloseHtml: true,
        homeBestSellerSlugs: true,
        homeVideoUrl: true,
        footerPolicyLinks: true,
        pixGateway: true
      }
    })

    return { ok: true, settings: created }
  }

  const existing = await prismaAny.siteSettings.findFirst({
    where: { storeSlug },
    select: {
      id: true,
      googleAnalyticsId: true,
      googleAdsConversionId: true,
      googleAdsConversionLabel: true,
      headHtml: true,
      bodyOpenHtml: true,
      bodyCloseHtml: true,
      homeBestSellerSlugs: true,
      homeVideoUrl: true,
      footerPolicyLinks: true,
      pixGateway: true
    }
  })

  if (existing) return { ok: true, settings: existing }

  const legacy = await prismaAny.siteSettings.findFirst({
    where: { storeSlug: null },
    select: {
      googleAnalyticsId: true,
      googleAdsConversionId: true,
      googleAdsConversionLabel: true,
      headHtml: true,
      bodyOpenHtml: true,
      bodyCloseHtml: true,
      homeBestSellerSlugs: true,
      homeVideoUrl: true,
      footerPolicyLinks: true,
      pixGateway: true
    }
  })

  const created = await prismaAny.siteSettings.create({
    data: {
      storeSlug,
      ...(legacy || {})
    },
    select: {
      id: true,
      googleAnalyticsId: true,
      googleAdsConversionId: true,
      googleAdsConversionLabel: true,
      headHtml: true,
      bodyOpenHtml: true,
      bodyCloseHtml: true,
      homeBestSellerSlugs: true,
      homeVideoUrl: true,
      footerPolicyLinks: true,
      pixGateway: true
    }
  })

  return { ok: true, settings: created }
})
