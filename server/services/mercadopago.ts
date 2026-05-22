/**
 * MercadoPago service — PIX + cartão de crédito (Brasil)
 */

function getAccessToken(): string {
  const token = String(process.env.MERCADOPAGO_ACCESS_TOKEN || '').trim()
  if (!token) throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado')
  return token
}

const BASE = 'https://api.mercadopago.com'

async function mpFetch(path: string, opts: RequestInit = {}): Promise<any> {
  console.log('[mpFetch] Request:', path, JSON.stringify(opts.body || {}, null, 2))
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
    },
  })
  const data = await res.json()
  console.log('[mpFetch] Response status:', res.status)
  console.log('[mpFetch] Response data:', data)
  if (!res.ok) {
    const msg = data?.message || data?.error || data?.cause?.[0]?.description || String(res.status)
    console.error('[mpFetch] Mercado Pago error:', msg)
    console.error('[mpFetch] Full error response:', JSON.stringify(data, null, 2))
    throw new Error(`MercadoPago [${res.status}]: ${msg}`)
  }
  return data
}

// ─── PIX ────────────────────────────────────────────────────────────────────

export interface MercadoPagoPixResult {
  payment_id: string
  qr_code: string        // texto EMV para copiar
  qr_code_base64: string // imagem PNG em base64
  expires_at: string
}

export async function createMercadoPagoPix(opts: {
  orderId: string
  amountBrl: number
  description?: string
  customer: { name: string; email: string; document: string }
  items?: Array<{ title: string; quantity: number; unit_price: number }>
}): Promise<MercadoPagoPixResult> {
  const nameParts = opts.customer.name.trim().split(/\s+/)
  const firstName = nameParts[0] || 'Cliente'
  const lastName  = nameParts.slice(1).join(' ') || firstName

  const siteUrl = String(process.env.SITE_URL || '').replace(/\/$/, '')

  const body: any = {
    transaction_amount: opts.amountBrl,
    description: (opts.description || 'Pedido').slice(0, 60),
    payment_method_id: 'pix',
    external_reference: opts.orderId,
    date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    payer: {
      email: opts.customer.email,
      first_name: firstName,
      last_name: lastName,
      identification: {
        type: 'CPF',
        number: opts.customer.document.replace(/\D/g, ''),
      },
    },
  }

  // Se itens foram fornecidos, adiciona ao body
  if (opts.items && opts.items.length > 0) {
    body.items = opts.items.map(item => ({
      title: item.title,
      quantity: item.quantity,
      currency_id: 'BRL',
      unit_price: item.unit_price
    }))
  }

  if (siteUrl) {
    body.notification_url = `${siteUrl}/api/mercadopago/webhook`
  }

  const data = await mpFetch('/v1/payments', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': `pix-${opts.orderId}` },
    body: JSON.stringify(body),
  })

  const txData = data?.point_of_interaction?.transaction_data

  return {
    payment_id: String(data.id),
    qr_code:        txData?.qr_code        || '',
    qr_code_base64: txData?.qr_code_base64 || '',
    expires_at:     data.date_of_expiration || '',
  }
}

// ─── CARTÃO ──────────────────────────────────────────────────────────────────

export interface MercadoPagoCardResult {
  payment_id: string
  status: string   // 'approved' | 'rejected' | 'pending' | 'in_process'
}

export async function createMercadoPagoCard(opts: {
  orderId: string
  amountBrl: number
  installments?: number
  customer: { name: string; email: string; document: string }
  token: string    // token gerado pelo SDK MP no frontend
  items?: Array<{ title: string; quantity: number; unit_price: number }>
}): Promise<MercadoPagoCardResult> {
  console.log('[mercadoPagoCard] ===== START =====')
  console.log('[mercadoPagoCard] orderId:', opts.orderId)
  console.log('[mercadoPagoCard] amountBrl:', opts.amountBrl)
  console.log('[mercadoPagoCard] installments:', opts.installments)
  console.log('[mercadoPagoCard] token:', opts.token ? 'present' : 'missing')
  console.log('[mercadoPagoCard] customer:', opts.customer)
  console.log('[mercadoPagoCard] items:', opts.items)
  
  const nameParts = opts.customer.name.trim().split(/\s+/)
  const firstName = nameParts[0] || 'Cliente'
  const lastName  = nameParts.slice(1).join(' ') || firstName

  const siteUrl = String(process.env.SITE_URL || '').replace(/\/$/, '')
  console.log('[mercadoPagoCard] siteUrl:', siteUrl)

  const body: any = {
    transaction_amount: opts.amountBrl,
    token: opts.token,
    installments: opts.installments ?? 1,
    external_reference: opts.orderId,
    payer: {
      email: opts.customer.email,
      first_name: firstName,
      last_name: lastName,
      identification: {
        type: 'CPF',
        number: opts.customer.document.replace(/\D/g, ''),
      },
    },
  }

  // Nota: Mercado Pago não aceita o parâmetro items para pagamentos com cartão
  // Apenas PIX aceita items. Para cartão, usar apenas transaction_amount

  if (siteUrl) {
    body.notification_url = `${siteUrl}/api/mercadopago/webhook`
  }

  console.log('[mercadoPagoCard] body enviado:', JSON.stringify(body, null, 2))
  console.log('[mercadoPagoCard] acessstoken configured:', !!process.env.MERCADOPAGO_ACCESS_TOKEN)

  try {
    const data = await mpFetch('/v1/payments', {
      method: 'POST',
      headers: { 'X-Idempotency-Key': `card-${opts.orderId}` },
      body: JSON.stringify(body),
    })

    console.log('[mercadoPagoCard] response:', data)
    console.log('[mercadoPagoCard] payment_id:', data.id)
    console.log('[mercadoPagoCard] status:', data.status)

    return {
      payment_id: String(data.id),
      status: String(data.status || 'pending'),
    }
  } catch (error: any) {
    console.error('[mercadoPagoCard] ===== ERROR =====')
    console.error('[mercadoPagoCard] error:', error)
    console.error('[mercadoPagoCard] message:', error?.message)
    console.error('[mercadoPagoCard] stack:', error?.stack)
    throw error
  }
}
