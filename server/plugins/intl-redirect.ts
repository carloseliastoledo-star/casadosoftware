import { defineNitroPlugin } from 'nitropack/runtime'
import { sendRedirect } from 'h3'
import { getStoreContext } from '../utils/store'

export default defineNitroPlugin((nitroApp: any) => {
  nitroApp.hooks.hook('request', async (event: any) => {
    try {
      const url = String(event?.node?.req?.url || '')
      const match = url.match(/^\/produto\/([^/?#]+)/)
      if (!match) return

      const { storeSlug } = getStoreContext(event)
      if (storeSlug !== 'international') return

      const slug = match[1]
      await sendRedirect(event, `/checkout-intl?product=${encodeURIComponent(slug)}`, 302)
    } catch {
      // never block the request
    }
  })
})
