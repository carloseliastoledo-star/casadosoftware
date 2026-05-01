import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result: any = await $fetch('/api/checkout', {
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

  return {
    ...result,
    checkoutUrl: result?.checkoutUrl || result?.paymentUrl || result?.pixUrl || null
  }
})
