import { defineEventHandler } from 'h3'
import prisma from '#root/server/db/prisma'
import { getStoreContext } from '#root/server/utils/store'

const SELECT = {
  googleAnalyticsId: true,
  googleAdsConversionId: true,
  googleAdsConversionLabel: true,
  metaPixelId: true,
  tiktokPixelId: true,
  headHtml: true,
  bodyOpenHtml: true,
  bodyCloseHtml: true
}

export default defineEventHandler(async () => {
  const { storeSlug } = getStoreContext()
  const prismaAny = prisma as any

  try {
    let settings = null

    if (!storeSlug) {
      settings = await prismaAny.siteSettings.findFirst({ select: SELECT })
    } else {
      settings = await prismaAny.siteSettings.findFirst({
        where: { storeSlug },
        select: SELECT
      })
    }

    if (!settings) {
      return {
        ga4Id: null,
        googleAdsConversionId: null,
        googleAdsLabel: null,
        metaPixelId: null,
        tiktokPixelId: null,
        headHtml: null,
        bodyStartHtml: null
      }
    }

    return {
      ga4Id: String(settings.googleAnalyticsId || '').trim() || null,
      googleAdsConversionId: String(settings.googleAdsConversionId || '').trim() || null,
      googleAdsLabel: String(settings.googleAdsConversionLabel || '').trim() || null,
      metaPixelId: String(settings.metaPixelId || '').trim() || null,
      tiktokPixelId: String(settings.tiktokPixelId || '').trim() || null,
      headHtml: String(settings.headHtml || '') || null,
      bodyStartHtml: String(settings.bodyOpenHtml || '') || null
    }
  } catch (err: any) {
    console.error('[api][public][settings][tracking] error:', err?.message || err)
    return {
      ga4Id: null,
      googleAdsConversionId: null,
      googleAdsLabel: null,
      metaPixelId: null,
      tiktokPixelId: null,
      headHtml: null,
      bodyStartHtml: null
    }
  }
})
