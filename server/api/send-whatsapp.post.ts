import { defineEventHandler, readBody } from 'h3'
import { sendWhatsAppText } from '../utils/whatsapp'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const phone = String(body?.phone || '').trim()
  const message = String(body?.message || '').trim()

  if (!phone) {
    return { success: false, error: 'phone_required' }
  }

  try {
    const result = await sendWhatsAppText(phone, message)

    if (!result.success) {
      console.error('[SEND_WHATSAPP_ERROR]', result.error)
    }

    return result
  } catch (error) {
    console.error('[SEND_WHATSAPP_ERROR]', error)
    return { success: false }
  }
})
