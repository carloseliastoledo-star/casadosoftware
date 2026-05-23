import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('[create-pix] ===== BLOCKED =====', new Date().toISOString())
  
  // Rota antiga bloqueada - usar /api/mercadopago/pix em vez disso
  throw createError({
    statusCode: 410,
    statusMessage: 'Rota descontinuada',
    data: {
      code: 'ROUTE_DEPRECATED',
      message: 'Esta rota foi descontinuada. Use /api/mercadopago/pix em vez disso.',
      newEndpoint: '/api/mercadopago/pix'
    }
  })
})
