/**
 * useEcommerceTracking - GA4 + Google Ads e-commerce tracking
 * SSR-safe, sem IDs hardcoded, padrão GA4 ecommerce
 *
 * Eventos:
 *  - view_item        → página de produto
 *  - add_to_cart      → botão "Comprar Agora"
 *  - begin_checkout   → início do checkout
 *  - purchase         → SOMENTE na página de obrigado, com dados reais do pedido
 */

export type TrackingItem = {
  item_id?: string | number
  item_name: string
  price: number
  quantity?: number
  item_category?: string
}

export type PurchasePayload = {
  transaction_id: string
  value: number
  currency: 'BRL' | 'USD'
  gateway: 'mercado_pago' | 'stripe'
  items: TrackingItem[]
}

export function useEcommerceTracking() {
  const hasGtag = (): boolean => {
    return import.meta.client && typeof window !== 'undefined' && typeof window.gtag === 'function'
  }

  const formatItems = (items: TrackingItem[]) => {
    return items.map((item) => ({
      item_id: String(item.item_id || item.item_name),
      item_name: item.item_name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      item_category: item.item_category || 'Software'
    }))
  }

  const trackEvent = (eventName: string, payload: Record<string, any>) => {
    if (!hasGtag()) {
      if (import.meta.client) {
        console.warn(`[GA4] gtag não disponível para evento: ${eventName}`)
      }
      return
    }

    window.gtag!('event', eventName, payload)
    console.log(`[GA4] ${eventName}`, payload)
  }

  const trackViewItem = (item: TrackingItem, currency: 'BRL' | 'USD' = 'BRL') => {
    if (!import.meta.client) return

    trackEvent('view_item', {
      currency,
      value: Number(item.price || 0),
      items: formatItems([item])
    })
  }

  const trackAddToCart = (item: TrackingItem, currency: 'BRL' | 'USD' = 'BRL') => {
    if (!import.meta.client) return

    trackEvent('add_to_cart', {
      currency,
      value: Number(item.price || 0),
      items: formatItems([item])
    })
  }

  const trackBeginCheckout = (
    items: TrackingItem[],
    currency: 'BRL' | 'USD',
    value: number,
    gateway: 'mercado_pago' | 'stripe'
  ) => {
    if (!import.meta.client) return

    trackEvent('begin_checkout', {
      currency,
      value: Number(value || 0),
      payment_type: gateway,
      items: formatItems(items)
    })
  }

  const trackPurchase = (payload: PurchasePayload) => {
    if (!import.meta.client) return

    const storageKey = `purchase_tracked_${payload.transaction_id}`

    try {
      if (localStorage.getItem(storageKey)) {
        console.log('[GA4] purchase já rastreado:', payload.transaction_id)
        return
      }
    } catch {
      // localStorage indisponível
    }

    trackEvent('purchase', {
      transaction_id: payload.transaction_id,
      value: Number(payload.value || 0),
      currency: payload.currency,
      payment_type: payload.gateway,
      affiliation: payload.gateway === 'mercado_pago' ? 'Mercado Pago Brasil' : 'Stripe Internacional',
      items: formatItems(payload.items)
    })

    try {
      localStorage.setItem(storageKey, 'true')
    } catch {
      // localStorage indisponível
    }

    console.log('[GA4] purchase rastreado:', payload.transaction_id, payload.value, payload.currency)
  }

  return {
    trackViewItem,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase
  }
}
