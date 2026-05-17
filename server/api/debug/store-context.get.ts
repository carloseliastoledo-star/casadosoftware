import { defineEventHandler, getRequestHeaders } from 'h3'
import { getStoreContext } from '../../utils/store'

export default defineEventHandler((event) => {
  const headers = getRequestHeaders(event)
  const { storeSlug, includeLegacy } = getStoreContext(event)

  return {
    storeSlug,
    includeLegacy,
    host: headers['host'] || null,
    xForwardedHost: headers['x-forwarded-host'] || null,
    xOriginalHost: headers['x-original-host'] || null,
    storeSlugEnv: process.env.STORE_SLUG || null,
    siteUrlEnv: process.env.SITE_URL || null,
  }
})
