import { defineEventHandler, createError, type H3Event } from 'h3'
import { getAdminSession } from '../utils/adminSession.js'

export default defineEventHandler((event: H3Event) => {
  const path = event.path || ''

  if (!path.startsWith('/api/admin')) return

  if (path.startsWith('/api/admin/auth/login')) return
  if (path.startsWith('/api/admin/auth/logout')) return

  const session = getAdminSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Não autorizado'
    })
  }
})
