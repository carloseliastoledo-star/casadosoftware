import { defineEventHandler } from 'h3'
import prisma from '#root/server/db/prisma'
import { getStoreContext } from '#root/server/utils/store'

const EMPTY = { ok: true, settings: null }

const SELECT = {
  id: true,
  googleAnalyticsId: true,
  googleAdsConversionId: true,
  googleAdsConversionLabel: true,
  headHtml: true,
  bodyOpenHtml: true,
  bodyCloseHtml: true,
  homeBestSellerSlugs: true,
  homeVideoUrl: true,
  footerPolicyLinks: true
}

export default defineEventHandler(async () => {
  const { storeSlug } = getStoreContext()

  const prismaAny = prisma as any

  try {
    if (!storeSlug) {
      const existing = await prismaAny.siteSettings.findFirst({ select: SELECT })
      if (existing) return { ok: true, settings: existing }

      try {
        const created = await prismaAny.siteSettings.create({ data: {}, select: SELECT })
        return { ok: true, settings: created }
      } catch {
        return EMPTY
      }
    }

    const existing = await prismaAny.siteSettings.findFirst({ where: { storeSlug }, select: SELECT })
    if (existing) return { ok: true, settings: existing }

    const legacy = await prismaAny.siteSettings.findFirst({ where: { storeSlug: null }, select: SELECT })

    try {
      const created = await prismaAny.siteSettings.create({
        data: { storeSlug, ...(legacy || {}) },
        select: SELECT
      })
      return { ok: true, settings: created }
    } catch {
      return legacy ? { ok: true, settings: legacy } : EMPTY
    }
  } catch (err: any) {
    console.error('[api][site-settings] db error', err?.message || err)
    return EMPTY
  }
})
