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
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
    },
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.message || data?.error || String(res.status)
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
}): Promise<MercadoPagoPixResult> {
  const nameParts = opts.customer.name.trim().split(/\s+/)
  const firstName = nameParts[0] || 'Cliente'
  const lastName  = nameParts.slice(1).join(' ') || firstName

  const body = {
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
}): Promise<MercadoPagoCardResult> {
  const nameParts = opts.customer.name.trim().split(/\s+/)
  const firstName = nameParts[0] || 'Cliente'
  const lastName  = nameParts.slice(1).join(' ') || firstName

  const body = {
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

  const data = await mpFetch('/v1/payments', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': `card-${opts.orderId}` },
    body: JSON.stringify(body),
  })

  return {
    payment_id: String(data.id),
    status: String(data.status || 'pending'),
  }
}
