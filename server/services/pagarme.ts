/**
 * Pagar.me v5 REST service — PIX + cartão de crédito + split de afiliado
 */

function getApiKey(): string {
  const key = String(process.env.PAGARME_API_KEY || '').trim()
  if (!key) throw new Error('PAGARME_API_KEY não configurado')
  return key
}

function authHeader(): string {
  return 'Basic ' + Buffer.from(getApiKey() + ':').toString('base64')
}

const BASE = 'https://api.pagar.me/core/v5'

export interface PagarmeCustomer {
  name: string
  email: string
  document: string          // CPF sem pontuação
  document_type?: 'CPF' | 'CNPJ'
  type?: 'individual' | 'company'
  phones?: {
    mobile_phone?: { country_code: string; area_code: string; number: string }
  }
}

export interface PagarmeSplitRule {
  recipient_id: string      // ID do recebedor no Pagar.me
  amount?: number           // valor fixo em centavos (use amount OU percentage)
  percentage?: number       // percentual 0-100
  liable?: boolean
  charge_processing_fee?: boolean
}

export interface PagarmePixResult {
  charge_id: string
  qr_code: string
  qr_code_url: string
  expires_at: string
}

export interface PagarmeCardResult {
  charge_id: string
  status: string            // 'paid' | 'failed' | 'pending'
  acquirer_return_code?: string
}

// ─── PIX ─────────────────────────────────────────────────────────────────────

export async function createPagarmePix(opts: {
  orderId: string
  amountBrl: number
  description?: string
  customer: PagarmeCustomer
  split?: PagarmeSplitRule[]
  expiresInSeconds?: number
}): Promise<PagarmePixResult> {
  const amountCents = Math.round(opts.amountBrl * 100)

  const body: any = {
    code: `order_${opts.orderId}`,
    items: [
      {
        amount: amountCents,
        description: opts.description || 'Pedido',
        quantity: 1,
        code: opts.orderId,
      },
    ],
    customer: {
      name: opts.customer.name,
      email: opts.customer.email,
      type: opts.customer.type || 'individual',
      document: opts.customer.document.replace(/\D/g, ''),
      document_type: opts.customer.document_type || 'CPF',
    },
    payments: [
      {
        payment_method: 'pix',
        pix: {
          expires_in: opts.expiresInSeconds ?? 3600,
        },
      },
    ],
  }

  if (opts.split?.length) {
    body.payments[0].split = opts.split
  }

  console.log('[pagarme] createPagarmePix request:', JSON.stringify(body, null, 2))

  let res: any
  try {
    res = await $fetch<any>(`${BASE}/orders`, {
      method: 'POST',
      headers: {
        Authorization: authHeader(),
        'Content-Type': 'application/json',
      },
      body,
    })
  } catch (fetchErr: any) {
    console.error('[pagarme] createPagarmePix API error:', JSON.stringify({
      status: fetchErr?.status || fetchErr?.statusCode,
      message: fetchErr?.message,
      data: fetchErr?.data,
      response: fetchErr?.response?._data,
    }, null, 2))
    throw fetchErr
  }

  console.log('[pagarme] createPagarmePix response:', JSON.stringify(res, null, 2))

  const charge = res?.charges?.[0] || {}
  const lastTx = charge?.last_transaction || {}
  return {
    charge_id: charge.id || res.id,
    qr_code: lastTx?.qr_code || '',
    qr_code_url: lastTx?.qr_code_url || '',
    expires_at: lastTx?.expires_at || '',
  }
}

// ─── Cartão de crédito ────────────────────────────────────────────────────────

export async function createPagarmeCard(opts: {
  orderId: string
  amountBrl: number
  installments?: number
  customer: PagarmeCustomer
  card: {
    number: string
    holder_name: string
    exp_month: number
    exp_year: number
    cvv: string
  }
  split?: PagarmeSplitRule[]
}): Promise<PagarmeCardResult> {
  const amountCents = Math.round(opts.amountBrl * 100)

  const body: any = {
    code: `order_${opts.orderId}`,
    amount: amountCents,
    currency: 'BRL',
    payment_method: 'credit_card',
    customer: {
      name: opts.customer.name,
      email: opts.customer.email,
      type: opts.customer.type || 'individual',
      document: opts.customer.document.replace(/\D/g, ''),
      document_type: opts.customer.document_type || 'CPF',
    },
    credit_card: {
      installments: opts.installments ?? 1,
      statement_descriptor: 'CASADOSOFTWARE',
      card: {
        number: opts.card.number.replace(/\s/g, ''),
        holder_name: opts.card.holder_name,
        exp_month: opts.card.exp_month,
        exp_year: opts.card.exp_year,
        cvv: opts.card.cvv,
      },
    },
  }

  if (opts.split?.length) {
    body.split = opts.split
  }

  const res = await $fetch<any>(`${BASE}/charges`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body,
  })

  return {
    charge_id: res.id || res.charge_id,
    status: res.status || 'pending',
    acquirer_return_code: res?.last_transaction?.acquirer_return_code,
  }
}

// ─── Upsell 1-click via cartão salvo (token) ─────────────────────────────────

export async function createPagarmeUpsell(opts: {
  orderId: string
  amountBrl: number
  customer: PagarmeCustomer
  cardToken: string         // token gerado no checkout original
}): Promise<PagarmeCardResult> {
  const amountCents = Math.round(opts.amountBrl * 100)

  const body: any = {
    code: `upsell_${opts.orderId}`,
    amount: amountCents,
    currency: 'BRL',
    payment_method: 'credit_card',
    customer: {
      name: opts.customer.name,
      email: opts.customer.email,
      type: opts.customer.type || 'individual',
      document: opts.customer.document.replace(/\D/g, ''),
      document_type: opts.customer.document_type || 'CPF',
    },
    credit_card: {
      installments: 1,
      statement_descriptor: 'CASADOSOFTWARE',
      card_token: opts.cardToken,
    },
  }

  const res = await $fetch<any>(`${BASE}/charges`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body,
  })

  return {
    charge_id: res.id || res.charge_id,
    status: res.status || 'pending',
  }
}

// ─── Verificar status de uma charge ──────────────────────────────────────────

export async function getPagarmeCharge(chargeId: string) {
  return await $fetch<any>(`${BASE}/charges/${chargeId}`, {
    headers: { Authorization: authHeader() },
  })
}
