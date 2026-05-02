import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('[WHATSAPP_STATUS]', JSON.stringify(body))
  } catch (error) {
    console.error('[WHATSAPP_STATUS_ERROR]', error)
  }

  return { success: true }
})
