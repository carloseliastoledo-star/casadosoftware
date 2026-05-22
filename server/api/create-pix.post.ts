import { defineEventHandler, readBody, getRequestURL, createError } from 'h3'

function maskEmail(email: string): string {
  if (!email) return 'missing'
  const [local, domain] = email.split('@')
  if (!domain) return email
  return `${local.substring(0, 2)}***@${domain}`
}

function maskDocument(doc: string): string {
  if (!doc) return 'missing'
  const cleaned = doc.replace(/\D/g, '')
  if (cleaned.length <= 4) return '***'
  return `${cleaned.substring(0, 3)}***${cleaned.substring(cleaned.length - 2)}`
}

export default defineEventHandler(async (event) => {
  console.log('[create-pix] ===== START =====', new Date().toISOString())
  
  const body = await readBody(event)
  
  // Logging seguro (sem expor dados sensíveis)
  console.log('[create-pix] body keys:', Object.keys(body || {}))
  console.log('[create-pix] produtoId:', body?.produtoId)
  console.log('[create-pix] email:', maskEmail(String(body?.email || '')))
  console.log('[create-pix] document:', maskDocument(String(body?.document || '')))
  console.log('[create-pix] method:', body?.method)
  console.log('[create-pix] currency:', body?.currency)
  
  // Validar token do Mercado Pago
  const mpToken = String(process.env.MERCADOPAGO_ACCESS_TOKEN || '').trim()
  const hasToken = !!mpToken && mpToken.length > 10
  console.log('[create-pix] MERCADOPAGO_ACCESS_TOKEN configured:', hasToken, 'length:', mpToken.length)
  
  if (!hasToken) {
    console.error('[create-pix] ERROR: MERCADOPAGO_ACCESS_TOKEN not configured')
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuração de pagamento indisponível',
      data: { code: 'MP_TOKEN_MISSING', message: 'Token do Mercado Pago não configurado' }
    })
  }
  
  // Validar campos obrigatórios
  const produtoId = String(body?.produtoId || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const nome = String(body?.nome || body?.name || '').trim()
  const document = String(body?.document || body?.cpf || '').trim()
  const phone = String(body?.telefone || body?.phone || '').trim()
  const method = String(body?.method || 'pix').trim().toLowerCase()
  const currency = String(body?.currency || 'BRL').trim().toUpperCase()
  
  console.log('[create-pix] validation - produtoId:', !!produtoId, 'email:', !!email, 'nome:', !!nome, 'document:', !!document, 'phone:', !!phone, 'method:', method, 'currency:', currency)
  
  if (!email || !email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email inválido',
      data: { code: 'INVALID_EMAIL', message: 'Email é obrigatório e deve ser válido' }
    })
  }
  
  if (!nome) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nome inválido',
      data: { code: 'INVALID_NAME', message: 'Nome é obrigatório' }
    })
  }
  
  if (!document || document.replace(/\D/g, '').length < 11) {
    throw createError({
      statusCode: 400,
      statusMessage: 'CPF inválido',
      data: { code: 'INVALID_DOCUMENT', message: 'CPF deve ter pelo menos 11 dígitos' }
    })
  }
  
  if (method !== 'pix') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Método de pagamento inválido',
      data: { code: 'INVALID_METHOD', message: 'Este endpoint aceita apenas pagamento PIX' }
    })
  }
  
  const origin = getRequestURL(event).origin
  console.log('[create-pix] origin:', origin)
  
  try {
    console.log('[create-pix] calling /api/checkout with method=pix')
    const result: any = await $fetch('/api/checkout', {
      baseURL: origin,
      method: 'POST',
      body: {
        produtoId,
        email,
        nome,
        document: document.replace(/\D/g, ''),
        phone: phone.replace(/\D/g, ''),
        method: 'pix',
        currency,
        orderBump: body?.orderBump || false,
        orderBumpIds: body?.orderBumpIds || [],
        couponCode: body?.couponCode,
        couponPercent: body?.couponPercent,
        cartItems: body?.cartItems || [],
        landingPage: body?.landingPage,
        tracking: body?.tracking
      }
    })
    
    console.log('[create-pix] checkout success')
    console.log('[create-pix] result keys:', Object.keys(result || {}))
    console.log('[create-pix] has qrCode:', !!result?.qrCode, 'has qrCodeUrl:', !!result?.qrCodeUrl)

    return {
      ...result,
      checkoutUrl: result?.checkoutUrl || result?.paymentUrl || result?.pixUrl || null
    }
  } catch (err: any) {
    console.error('[create-pix] ===== ERROR =====')
    console.error('[create-pix] error message:', err?.message)
    console.error('[create-pix] error statusCode:', err?.statusCode)
    console.error('[create-pix] error statusMessage:', err?.statusMessage)
    console.error('[create-pix] error data:', err?.data)
    console.error('[create-pix] error response:', err?.response?.data || err?.response)
    
    // Retornar erro claro para o frontend
    const statusCode = err?.statusCode || err?.status || 500
    const statusMessage = err?.statusMessage || err?.message || 'Erro ao processar pagamento PIX'
    
    throw createError({
      statusCode,
      statusMessage,
      data: {
        code: err?.data?.code || 'PIX_ERROR',
        message: statusMessage,
        details: err?.data?.message || err?.data || null
      }
    })
  }
})
