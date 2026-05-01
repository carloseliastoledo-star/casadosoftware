import { defineEventHandler, readBody } from 'h3'
import { sendWhatsAppText } from '../utils/whatsapp'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const phone = String(body?.phone || '').trim()

  try {
    const result = await sendWhatsAppText(
      phone,
      'Teste Casa do Software ✅ WhatsApp automático funcionando.'
    )

    if (!result.success) {
      console.error('[SEND_WHATSAPP_ERROR]', result.error)
    }

    return result
  } catch (error) {
    console.error('[SEND_WHATSAPP_ERROR]', error)
    return { success: false }
  }
})
