import { defineEventHandler } from 'h3'

export default defineEventHandler(async (_event) => {
  const dbUrl = process.env.DATABASE_URL || ''
  const masked = dbUrl
    ? dbUrl.replace(/:([^:@]+)@/, ':***@').substring(0, 100)
    : '(not set)'

  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    dbUrlSet: !!dbUrl,
    dbUrlLength: dbUrl.length,
    dbUrlPreview: masked,
    dbUrlStartsWith: dbUrl.substring(0, 10),
    nitroPreset: process.env.NITRO_PRESET,
    storeSlug: process.env.STORE_SLUG,
    siteUrl: process.env.SITE_URL
  }
})
