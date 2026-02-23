export type AnalyticsItem = {
  item_id: string
  item_name: string
  price: number
  quantity: number
}

export type AnalyticsCart = {
  total: number
  items: AnalyticsItem[]
  currency?: string
}

export type AnalyticsOrder = {
  id: string
  total: number
  items: AnalyticsItem[]
  currency?: string
}

function getGtag(): any {
  if (!import.meta.client) return null
  const w = window as any
  return typeof w.gtag === 'function' ? w.gtag : null
}

function safeCurrency(currency?: string) {
  const c = String(currency || '').trim().toUpperCase()
  return c || 'BRL'
}

export function trackViewItem(product: any) {
  const gtag = getGtag()
  if (!gtag) return

  const price = Number(product?.preco ?? product?.price ?? 0)
  const id = String(product?.id ?? '')
  const name = String(product?.nome ?? product?.name ?? '')

  if (!id || !name) return

  gtag('event', 'view_item', {
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

export function trackBeginCheckout(cart: AnalyticsCart) {
  const gtag = getGtag()
  if (!gtag) return

  const items = Array.isArray(cart?.items) ? cart.items : []
  const value = Number(cart?.total ?? 0)

  gtag('event', 'begin_checkout', {
    currency: safeCurrency(cart?.currency),
    value,
    items
  })
}

export function trackPurchase(order: AnalyticsOrder) {
  const gtag = getGtag()
  if (!gtag) return

  const items = Array.isArray(order?.items) ? order.items : []
  const value = Number(order?.total ?? 0)

  const transactionId = String(order?.id ?? '').trim()
  if (!transactionId) return

  gtag('event', 'purchase', {
    transaction_id: transactionId,
    currency: safeCurrency(order?.currency),
    value,
    items
  })
}
