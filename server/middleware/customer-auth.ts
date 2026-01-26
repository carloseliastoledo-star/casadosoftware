import { defineEventHandler, createError, type H3Event } from 'h3'
import { getCustomerSession } from '../utils/customerSession.js'

export default defineEventHandler((event: H3Event) => {
  const path = event.path || ''

  if (!path.startsWith('/api/customer')) return

  if (path.startsWith('/api/customer/auth/login')) return
  if (path.startsWith('/api/customer/auth/register')) return
  if (path.startsWith('/api/customer/auth/logout')) return
  if (path.startsWith('/api/customer/auth/forgot')) return
  if (path.startsWith('/api/customer/auth/reset')) return

  const session = getCustomerSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }
})
