import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  const { storeSlug } = getStoreContext(event)
  const storeSlugNoEvent = getStoreContext().storeSlug

  const allSettings = await (prisma as any).siteSettings.findMany({
    select: {
      id: true,
      storeSlug: true,
      homeBestSellerSlugs: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return {
    storeSlugFromEvent: storeSlug,
    storeSlugWithoutEvent: storeSlugNoEvent,
    totalRecords: allSettings.length,
    records: allSettings.map((s: any) => ({
      id: s.id,
      storeSlug: s.storeSlug,
      hasSlugs: !!s.homeBestSellerSlugs,
      slugsLength: String(s.homeBestSellerSlugs || '').length,
      slugsPreview: String(s.homeBestSellerSlugs || '').substring(0, 200),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }))
  }
})
