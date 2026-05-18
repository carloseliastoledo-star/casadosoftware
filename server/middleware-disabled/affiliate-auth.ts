import { defineEventHandler, createError, type H3Event } from 'h3'
import { getAffiliateSession } from '../utils/affiliateSession'

export default defineEventHandler((event: H3Event) => {
  const path = event.path || ''

  if (!path.startsWith('/api/affiliate')) return

  if (path.startsWith('/api/affiliate-apply')) return

  if (path.startsWith('/api/affiliate/auth/login')) return
  if (path.startsWith('/api/affiliate/auth/logout')) return
  if (path.startsWith('/api/affiliate/auth/activate')) return

  const session = getAffiliateSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }
})
