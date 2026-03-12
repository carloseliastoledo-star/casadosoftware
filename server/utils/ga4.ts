import prisma from '../db/prisma'

function stableClientIdFromUserId(userId: string): string {
  const u = String(userId || '').trim()
  if (!u) return ''

  let h1 = 2166136261
  for (let i = 0; i < u.length; i++) {
    h1 ^= u.charCodeAt(i)
    h1 = Math.imul(h1, 16777619)
  }

  let h2 = 2166136261
  const u2 = `${u}_b`
  for (let i = 0; i < u2.length; i++) {
    h2 ^= u2.charCodeAt(i)
    h2 = Math.imul(h2, 16777619)
  }

  return `${(h1 >>> 0) % 10000000000}.${(h2 >>> 0) % 10000000000}`
}

function resolveMeasurementId(): string {
  const envId = String(process.env.GA4_MEASUREMENT_ID || '').trim()
  if (envId) return envId

  const googleAnalyticsId = String(process.env.GOOGLE_ANALYTICS_ID || process.env.GA_ID || '').trim()
  return googleAnalyticsId
}

function resolveApiSecret(): string {
  return String(process.env.GA4_API_SECRET || '').trim()
}

function isGa4MeasurementId(id: string): boolean {
  const v = String(id || '').trim()
  return v.startsWith('G-')
}

function pickCurrency(currency?: string | null): string {
  const c = String(currency || '').trim().toUpperCase()
  return c || 'BRL'
}

async function postMeasurementProtocol(payload: any) {
  const measurementId = resolveMeasurementId()
  const apiSecret = resolveApiSecret()

  if (!measurementId || !apiSecret) return { ok: false, reason: 'missing_config' as const }
  if (!isGa4MeasurementId(measurementId)) return { ok: false, reason: 'invalid_measurement_id' as const }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    return { ok: false, reason: 'http_error' as const, status: resp.status, text }
  }

  return { ok: true }
}

export async function sendGa4PurchaseForOrder(orderId: string, source: string) {
  const id = String(orderId || '').trim()
  if (!id) return { ok: false, reason: 'missing_order_id' as const }

  const order = await (prisma as any).order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      currency: true,
      customerId: true,
      produto: {
        select: {
          id: true,
          nome: true,
          preco: true
        }
      }
    }
  })

  if (!order) return { ok: false, reason: 'order_not_found' as const }

  const status = String(order.status || '').toUpperCase()
  if (status !== 'PAID') return { ok: false, reason: 'order_not_paid' as const }

  const value = Number(order.totalAmount ?? order.produto?.preco ?? 0)
  const currency = pickCurrency(order.currency)

  const eventId = `purchase_${order.id}`

  const userId = String(order.customerId || '')
  const clientId = stableClientIdFromUserId(userId)
  const nowMicros = Date.now() * 1000

  const payload = {
    ...(clientId ? { client_id: clientId } : {}),
    ...(userId ? { user_id: userId } : {}),
    events: [
      {
        name: 'purchase',
        params: {
          event_id: eventId,
          transaction_id: String(order.id),
          currency,
          value,
          timestamp_micros: nowMicros,
          engagement_time_msec: 1,
          items: [
            {
              item_id: String(order.produto?.id || ''),
              item_name: String(order.produto?.nome || ''),
              price: Number(order.produto?.preco ?? value),
              quantity: 1
            }
          ],
          payment_type: String(source || '').trim() || undefined
        }
      }
    ]
  }

  return await postMeasurementProtocol(payload)
}
