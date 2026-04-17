/**
 * useTracking - Composable centralizado para tracking de eventos
 * SSR-safe, sem IDs hardcoded, busca configurações dinamicamente
 */

export type TrackingItem = {
  item_id: string
  item_name: string
  price: number
  quantity: number
}

export type TrackingCart = {
  total: number
  items: TrackingItem[]
  currency?: string
}

export type TrackingOrder = {
  id: string
  total: number
  items: TrackingItem[]
  currency?: string
}

function getGtag(): any {
  if (!import.meta.client) return null
  const w = window as any
  return typeof w.gtag === 'function' ? w.gtag : null
}

function getFbq(): any {
  if (!import.meta.client) return null
  const w = window as any
  return typeof w.fbq === 'function' ? w.fbq : null
}

function getTtq(): any {
  if (!import.meta.client) return null
  const w = window as any
  return typeof w.ttq === 'function' ? w.ttq : null
}

function safeCurrency(currency?: string) {
  const c = String(currency || '').trim().toUpperCase()
  return c || 'BRL'
}

/**
 * Busca configurações de tracking do endpoint público
 */
async function getTrackingSettings() {
  try {
    const data = await $fetch('/api/public/settings/tracking')
    return data || {
      ga4Id: null,
      googleAdsConversionId: null,
      googleAdsLabel: null,
      metaPixelId: null,
      tiktokPixelId: null,
      headHtml: null,
      bodyStartHtml: null
    }
  } catch {
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
}

/**
 * Dispara evento genérico do gtag
 */
export function trackGtag(eventName: string, payload?: Record<string, unknown>) {
  if (!import.meta.client) return
  try {
    const gtag = getGtag()
    if (gtag) {
      gtag('event', eventName, payload || {})
    }
  } catch {}
}

/**
 * Dispara evento genérico do Meta Pixel
 */
export function trackMeta(eventName: string, payload?: Record<string, unknown>) {
  if (!import.meta.client) return
  try {
    const fbq = getFbq()
    if (fbq) {
      fbq('track', eventName, { currency: 'BRL', ...(payload || {}) })
    }
  } catch {}
}

/**
 * Dispara evento genérico do TikTok Pixel
 */
export function trackTikTok(eventName: string, payload?: Record<string, unknown>) {
  if (!import.meta.client) return
  try {
    const ttq = getTtq()
    if (ttq) {
      ttq.track(eventName, payload || {})
    }
  } catch {}
}

/**
 * Dispara page view no GA4
 */
export async function trackPageView() {
  if (!import.meta.client) return
  try {
    const settings = await getTrackingSettings()
    const ga4Id = String(settings.ga4Id || '').trim()
    
    if (!ga4Id) return
    
    const gtag = getGtag()
    if (!gtag) return
    
    const pagePath = window.location.pathname + window.location.search + window.location.hash
    gtag('config', ga4Id, {
      page_path: pagePath,
      send_page_view: true
    })
  } catch {}
}

/**
 * Dispara view_item
 */
export function trackViewItem(product: any) {
  const gtag = getGtag()
  const fbq = getFbq()

  const price = Number(product?.preco ?? product?.price ?? 0)
  const id = String(product?.id ?? '')
  const name = String(product?.nome ?? product?.name ?? '')

  if (!id || !name) return

  if (gtag) {
    gtag('event', 'view_item', {
      currency: safeCurrency(product?.currency),
      value: price,
      items: [{ item_id: id, item_name: name, price, quantity: 1 }]
    })
  }
  if (fbq) fbq('track', 'ViewContent', { value: price, currency: safeCurrency(product?.currency), content_ids: [id], content_type: 'product' })
}

/**
 * Dispara add_to_cart
 */
export function trackAddToCart(product: any) {
  const gtag = getGtag()
  if (!gtag) return

  const price = Number(product?.preco ?? product?.price ?? 0)
  const id = String(product?.id ?? '')
  const name = String(product?.nome ?? product?.name ?? '')

  if (!id || !name) return

  gtag('event', 'add_to_cart', {
    currency: safeCurrency(product?.currency),
    value: price,
    items: [
      {
        item_id: id,
        item_name: name,
        price,
        quantity: 1
      }
    ]
  })
}

/**
 * Dispara begin_checkout
 */
export function trackBeginCheckout(cart: TrackingCart) {
  const gtag = getGtag()
  const fbq = getFbq()

  const items = Array.isArray(cart?.items) ? cart.items : []
  const value = Number(cart?.total ?? 0)

  if (gtag) gtag('event', 'begin_checkout', { currency: safeCurrency(cart?.currency), value, items })
  if (fbq) fbq('track', 'InitiateCheckout', { value, currency: safeCurrency(cart?.currency), num_items: items.length })
}

/**
 * Dispara purchase
 */
export function trackPurchase(order: TrackingOrder) {
  const gtag = getGtag()
  const fbq = getFbq()

  const items = Array.isArray(order?.items) ? order.items : []
  const value = Number(order?.total ?? 0)

  const transactionId = String(order?.id ?? '').trim()
  if (!transactionId) return

  if (gtag) gtag('event', 'purchase', { transaction_id: transactionId, currency: safeCurrency(order?.currency), value, items })
  if (fbq) fbq('track', 'Purchase', { value, currency: safeCurrency(order?.currency), content_ids: items.map((i: any) => i.item_id), content_type: 'product' })
}

/**
 * Dispara conversão do Google Ads
 * Só deve ser chamado na página /obrigado
 */
export async function trackGoogleAdsConversion(payload: Record<string, unknown> = {}) {
  if (!import.meta.client) return
  
  try {
    const settings = await getTrackingSettings()
    const googleAdsConversionId = String(settings.googleAdsConversionId || '').trim()
    const googleAdsLabel = String(settings.googleAdsLabel || '').trim()

    if (!googleAdsConversionId || !googleAdsLabel) return

    const gtag = getGtag()
    if (!gtag) return

    gtag('event', 'conversion', {
      send_to: `${googleAdsConversionId}/${googleAdsLabel}`,
      ...payload
    })
  } catch {}
}

/**
 * Hook principal do composable
 */
export const useTracking = () => {
  return {
    trackGtag,
    trackMeta,
    trackTikTok,
    trackPageView,
    trackViewItem,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase,
    trackGoogleAdsConversion
  }
}
