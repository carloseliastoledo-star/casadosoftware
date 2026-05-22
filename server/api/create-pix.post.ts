import { defineEventHandler, readBody, getRequestURL } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  console.log('[create-pix] ===== START =====')
  console.log('[create-pix] body received:', JSON.stringify(body, null, 2))
  console.log('[create-pix] body keys:', Object.keys(body || {}))
  
  const origin = getRequestURL(event).origin
  console.log('[create-pix] origin:', origin)
  
  try {
    console.log('[create-pix] calling /api/checkout with method=pix')
    const result: any = await $fetch('/api/checkout', {
      baseURL: origin,
      method: 'POST',
      body: {
        ...body,
        nome: body?.nome || body?.name || '',
        email: body?.email || '',
        telefone: body?.telefone || body?.phone || '',
        document: body?.document || body?.cpf || '',
        method: 'pix',
        currency: body?.currency || 'BRL'
      }
    })
    
    console.log('[create-pix] checkout success')
    console.log('[create-pix] result keys:', Object.keys(result || {}))

    return {
      ...result,
      checkoutUrl: result?.checkoutUrl || result?.paymentUrl || result?.pixUrl || null
    }
  } catch (err: any) {
    console.error('[create-pix] ===== ERROR =====')
    console.error('[create-pix] error:', err)
    console.error('[create-pix] error message:', err?.message)
    console.error('[create-pix] error status:', err?.statusCode)
    console.error('[create-pix] error data:', err?.data)
    console.error('[create-pix] error response:', err?.response)
    throw err
  }
})
