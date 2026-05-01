import { defineEventHandler, readBody } from 'h3'
import { sendWhatsAppText } from '../utils/whatsapp'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const phone = String(body?.phone || '').trim()
  const message = String(
    body?.message || 'Teste Casa do Software ✅ WhatsApp automático funcionando.'
  ).trim()

  return await sendWhatsAppText(phone, message)
})
