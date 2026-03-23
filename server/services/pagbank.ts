/**
 * PagBank (PagSeguro) v4 REST service — PIX + cartão de crédito
 * Docs: https://dev.pagbank.uol.com.br/reference
 */

function getToken(): string {
  const t = String(process.env.PAGBANK_TOKEN || '').trim()
  if (!t) throw new Error('PAGBANK_TOKEN não configurado')
  return t
}

const BASE = 'https://api.pagseguro.com'

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  }
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface PagbankPixResult {
  charge_id: string
  qr_code_text: string
  qr_code_png_url: string
  expires_at: string
}

export interface PagbankCardResult {
  charge_id: string
  status: string  // 'PAID' | 'DECLINED' | 'WAITING'
}

// ─── PIX ──────────────────────────────────────────────────────────────────────

export async function createPagbankPix(opts: {
  orderId: string
  amountBrl: number
  description?: string
  customer: { name: string; email: string; document: string }
  expiresInSeconds?: number
}): Promise<PagbankPixResult> {
  const amountCents = Math.round(opts.amountBrl * 100)
  const expiresAt = new Date(Date.now() + (opts.expiresInSeconds ?? 3600) * 1000).toISOString()

  const body: any = {
    reference_id: `order_${opts.orderId}`,
    description: (opts.description || 'Pedido').slice(0, 100),
    amount: { value: amountCents, currency: 'BRL' },
    payment_method: { type: 'PIX', installments: 1, capture: true },
    qr_codes: [{ expiration_date: expiresAt }],
    customer: {
      name: opts.customer.name,
      email: opts.customer.email,
      tax_id: opts.customer.document.replace(/\D/g, ''),
    },
  }

  console.log('[pagbank] createPagbankPix request:', JSON.stringify(body, null, 2))

  let res: any
  try {
    res = await $fetch<any>(`${BASE}/charges`, {
      method: 'POST',
      headers: authHeaders(),
      body,
    })
  } catch (err: any) {
    const detail = err?.data?.error_messages?.[0]?.description
      || err?.data?.message
      || err?.message
      || 'Erro PagBank PIX'
    console.error('[pagbank] PIX error:', detail)
    throw new Error(detail)
  }

  console.log('[pagbank] createPagbankPix response:', JSON.stringify(res, null, 2))

  const qrCode = res?.qr_codes?.[0] || {}
  const links: Array<{ rel: string; href: string }> = qrCode.links || []
  const pngUrl = links.find(l => l.rel === 'QRCODE.PNG')?.href || ''

  if (!qrCode.text) {
    throw new Error('PagBank não retornou o QR code PIX')
  }

  return {
    charge_id: res.id || '',
    qr_code_text: qrCode.text,
    qr_code_png_url: pngUrl,
    expires_at: qrCode.expiration_date || expiresAt,
  }
}

// ─── Cartão de crédito ────────────────────────────────────────────────────────

export async function createPagbankCard(opts: {
  orderId: string
  amountBrl: number
  installments?: number
  customer: { name: string; email: string; document: string }
  card: {
    number: string
    expMonth: string | number
    expYear: string | number
    cvv: string
    holderName: string
    holderDocument: string
  }
}): Promise<PagbankCardResult> {
  const amountCents = Math.round(opts.amountBrl * 100)

  const body: any = {
    reference_id: `order_${opts.orderId}`,
    description: 'Licença de software',
    amount: { value: amountCents, currency: 'BRL' },
    payment_method: {
      type: 'CREDIT_CARD',
      installments: opts.installments ?? 1,
      capture: true,
      soft_descriptor: 'CASADOSOFTWARE',
      card: {
        number: String(opts.card.number).replace(/\s/g, ''),
        exp_month: String(opts.card.expMonth).padStart(2, '0'),
        exp_year: String(opts.card.expYear).slice(-4),
        security_code: String(opts.card.cvv),
        holder: {
          name: opts.card.holderName,
          tax_id: opts.card.holderDocument.replace(/\D/g, ''),
        },
        store: false,
      },
    },
    customer: {
      name: opts.customer.name,
      email: opts.customer.email,
      tax_id: opts.customer.document.replace(/\D/g, ''),
    },
  }

  let res: any
  try {
    res = await $fetch<any>(`${BASE}/charges`, {
      method: 'POST',
      headers: authHeaders(),
      body,
    })
  } catch (err: any) {
    const detail = err?.data?.error_messages?.[0]?.description
      || err?.data?.message
      || err?.message
      || 'Erro PagBank cartão'
    console.error('[pagbank] card error:', detail)
    throw new Error(detail)
  }

  console.log('[pagbank] createPagbankCard status:', res?.status)

  return {
    charge_id: res.id || '',
    status: String(res.status || '').toUpperCase(),
  }
}

// ─── Consultar charge ─────────────────────────────────────────────────────────

export async function getPagbankCharge(chargeId: string) {
  return await $fetch<any>(`${BASE}/charges/${chargeId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
}
