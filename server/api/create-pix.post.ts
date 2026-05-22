import { defineEventHandler, readBody, getRequestURL, createError } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('[create-pix] ===== START =====', new Date().toISOString())
  
  const body = await readBody(event)
  
  // Aceitar tanto phone quanto telefone, nome quanto name
  const produtoId = String(body?.produtoId || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const nome = String(body?.nome || body?.name || '').trim()
  const document = String(body?.document || body?.cpf || '').trim()
  const phone = String(body?.phone || body?.telefone || '').trim()
  const method = String(body?.method || 'pix').trim().toLowerCase()
  const currency = String(body?.currency || 'BRL').trim().toUpperCase()
  const cartItems = Array.isArray(body?.cartItems) ? body.cartItems : []
  
  // Logs seguros
  console.log('[create-pix] token exists:', !!process.env.MERCADOPAGO_ACCESS_TOKEN)
  console.log('[create-pix] email exists:', !!email && email.includes('@'))
  console.log('[create-pix] document length:', document.replace(/\D/g, '').length)
  console.log('[create-pix] phone exists:', !!phone)
  console.log('[create-pix] cartItems length:', cartItems.length)
  console.log('[create-pix] method:', method)
  console.log('[create-pix] currency:', currency)
  
  // Validar token do Mercado Pago
  const mpToken = String(process.env.MERCADOPAGO_ACCESS_TOKEN || '').trim()
  if (!mpToken || mpToken.length < 10) {
    console.error('[create-pix] ERROR: MERCADOPAGO_ACCESS_TOKEN not configured')
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuração de pagamento indisponível',
      data: { code: 'MP_TOKEN_MISSING', message: 'Token do Mercado Pago não configurado' }
    })
  }
  
  // Validar campos obrigatórios
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
  
  const cleanDocument = document.replace(/\D/g, '')
  if (!cleanDocument || cleanDocument.length < 11) {
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
        document: cleanDocument,
        phone: phone.replace(/\D/g, ''),
        method: 'pix',
        currency,
        orderBump: body?.orderBump || false,
        orderBumpIds: body?.orderBumpIds || [],
        couponCode: body?.couponCode,
        couponPercent: body?.couponPercent,
        cartItems,
        landingPage: body?.landingPage,
        tracking: body?.tracking
      }
    })
    
    console.log('[create-pix] checkout success')
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
    
    // Tentar capturar status e body de erro do Mercado Pago
    const mpStatus = err?.response?.status || err?.statusCode
    const mpErrorBody = err?.response?.data || err?.data
    console.error('[create-pix] Mercado Pago status:', mpStatus)
    console.error('[create-pix] Mercado Pago error body:', JSON.stringify(mpErrorBody, null, 2))
    
    // Retornar erro claro para o frontend
    const statusCode = err?.statusCode || err?.status || 500
    const statusMessage = err?.statusMessage || err?.message || 'Erro ao processar pagamento PIX'
    
    throw createError({
      statusCode,
      statusMessage,
      data: {
        code: err?.data?.code || 'PIX_ERROR',
        message: statusMessage,
        details: err?.data?.message || err?.data || null,
        mpStatus,
        mpErrorBody
      }
    })
  }
})
