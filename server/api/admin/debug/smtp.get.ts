import { createError, defineEventHandler } from 'h3'
import { requireAdminSession } from '#root/server/utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const allowDebug =
    String(process.env.ALLOW_ADMIN_SMTP_DEBUG || '').trim().toLowerCase() === 'true'
  const isProd = String(process.env.NODE_ENV || '').trim() === 'production'

  if (isProd && !allowDebug) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const host = String(process.env.SMTP_HOST || '').trim()
  const port = String(process.env.SMTP_PORT || '').trim()
  const user = String(process.env.SMTP_USER || '').trim()
  const pass = String(process.env.SMTP_PASS || '').trim()
  const from = String(process.env.SMTP_FROM || '').trim()

  return {
    ok: true,
    smtp: {
      host: Boolean(host),
      port: Boolean(port),
      user: Boolean(user),
      pass: Boolean(pass),
      from: Boolean(from)
    }
  }
})
