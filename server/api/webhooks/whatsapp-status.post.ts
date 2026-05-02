import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    // Apenas log leve, sem processamento adicional
    console.log('[WHATSAPP_STATUS]', body?.event || body?.type || body?.status || 'unknown')
  } catch (error) {
    // Não lançar erro para evitar timeout
    console.error('[WHATSAPP_STATUS_ERROR]', error)
  }

  // Retornar sempre rápido
  return { ok: true }
})
