import { defineEventHandler, sendRedirect } from 'h3'
import { getStoreContext } from '../../utils/store'

export default defineEventHandler((event) => {
  const { storeSlug } = getStoreContext(event)

  if (storeSlug !== 'international') return

  const slug = String(event.context.params?.slug || '').trim()
  if (!slug) return

  return sendRedirect(event, `/checkout-intl?product=${encodeURIComponent(slug)}`, 302)
})
