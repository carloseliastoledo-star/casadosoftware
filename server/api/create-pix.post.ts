import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('[create-pix] ===== BLOQUEADO =====', new Date().toISOString())
  console.log('[create-pix] Esta rota foi descontinuada. Use /api/mercadopago/pix')
  
  throw createError({
    statusCode: 410,
    statusMessage: 'Esta rota foi descontinuada. Use /api/mercadopago/pix'
  })
})
