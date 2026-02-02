import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'
import { requireAdminSession } from '../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext()

  if (!storeSlug) {
    const existing = await prisma.siteSettings.findFirst({
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

    if (existing) return { ok: true, settings: existing }

    const created = await prisma.siteSettings.create({
      data: {},
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

    return { ok: true, settings: created }
  }

  const existing = await (prisma as any).siteSettings.findFirst({
    where: { storeSlug },
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

  if (existing) return { ok: true, settings: existing }

  const legacy = await (prisma as any).siteSettings.findFirst({
    where: { storeSlug: null },
    select: {
      googleAnalyticsId: true,
      googleAdsConversionId: true,
      googleAdsConversionLabel: true,
      headHtml: true,
      bodyOpenHtml: true,
      bodyCloseHtml: true,
      homeBestSellerSlugs: true
    }
  })

  const created = await (prisma as any).siteSettings.create({
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
      homeBestSellerSlugs: true
    }
  })

  return { ok: true, settings: created }
})
