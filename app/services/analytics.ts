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

function getFbq(): any {
  if (!import.meta.client) return null
  const w = window as any
  return typeof w.fbq === 'function' ? w.fbq : null
}

function safeCurrency(currency?: string) {
  const c = String(currency || '').trim().toUpperCase()
  return c || 'BRL'
}

export function trackViewItem(product: any) {
  const gtag = getGtag()
  const fbq  = getFbq()

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
  const fbq  = getFbq()

  const items = Array.isArray(cart?.items) ? cart.items : []
  const value = Number(cart?.total ?? 0)

  if (gtag) gtag('event', 'begin_checkout', { currency: safeCurrency(cart?.currency), value, items })
  if (fbq)  fbq('track', 'InitiateCheckout', { value, currency: safeCurrency(cart?.currency), num_items: items.length })
}

export function trackPurchase(order: AnalyticsOrder) {
  const gtag = getGtag()
  const fbq  = getFbq()

  const items = Array.isArray(order?.items) ? order.items : []
  const value = Number(order?.total ?? 0)

  const transactionId = String(order?.id ?? '').trim()
  if (!transactionId) return

  if (gtag) gtag('event', 'purchase', { transaction_id: transactionId, currency: safeCurrency(order?.currency), value, items })
  if (fbq)  fbq('track', 'Purchase', { value, currency: safeCurrency(order?.currency), content_ids: items.map((i: any) => i.item_id), content_type: 'product' })
}
