import { defineEventHandler, readBody, getRequestURL } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  console.log('[create-pix] start')
  console.log('[create-pix] body received:', Object.keys(body || {}))
  
  const origin = getRequestURL(event).origin
  console.log('[create-pix] origin:', origin)
  
  try {
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

    return {
      ...result,
      checkoutUrl: result?.checkoutUrl || result?.paymentUrl || result?.pixUrl || null
    }
  } catch (err: any) {
    console.error('[create-pix] error:', err)
    console.error('[create-pix] error message:', err?.message)
    console.error('[create-pix] error status:', err?.statusCode)
    throw err
  }
})
