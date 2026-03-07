import { createError, getHeader, type H3Event } from 'h3'
import { requireAdminSession } from './adminSession.js'

export function requireSeoOrAdmin(event: H3Event) {
  try {
    requireAdminSession(event)
    return { via: 'admin' as const }
  } catch {
    const secret = String(process.env.SEO_CRON_SECRET || '').trim()
    const header = String(getHeader(event, 'x-seo-cron-secret') || '').trim()
    if (secret && header && header === secret) {
      return { via: 'secret' as const }
    }
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }
}
