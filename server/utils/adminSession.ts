import crypto from 'crypto'
import { createError, getCookie, setCookie, type H3Event } from 'h3'

const COOKIE_NAME = 'admin_session'

type AdminSessionPayload = {
  email: string
  iat: number
  exp: number
}

function base64UrlEncode(input: string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  return Buffer.from(normalized + pad, 'base64').toString('utf8')
}

function sign(data: string, secret: string) {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export function setAdminSession(event: H3Event, email: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || ''
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ADMIN_SESSION_SECRET não configurado'
    })
  }

  const now = Math.floor(Date.now() / 1000)
  const payload: AdminSessionPayload = {
    email,
    iat: now,
    exp: now + 60 * 60 * 24 * 7
  }

  const payloadStr = JSON.stringify(payload)
  const payloadB64 = base64UrlEncode(payloadStr)
  const signature = sign(payloadB64, secret)

  const isProd = process.env.NODE_ENV === 'production'

  const host = String(event.node.req.headers.host || '')
    .split(':')[0]
    .trim()
  const baseHost = host.replace(/^www\./, '')
  const cookieDomain = (process.env.ADMIN_COOKIE_DOMAIN || (isProd && baseHost && baseHost !== 'localhost' ? `.${baseHost}` : '')) || undefined

  setCookie(event, COOKIE_NAME, `${payloadB64}.${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    domain: cookieDomain,
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })

  return payload
}

export function clearAdminSession(event: H3Event) {
  const isProd = process.env.NODE_ENV === 'production'
  const host = String(event.node.req.headers.host || '')
    .split(':')[0]
    .trim()
  const baseHost = host.replace(/^www\./, '')
  const cookieDomain = (process.env.ADMIN_COOKIE_DOMAIN || (isProd && baseHost && baseHost !== 'localhost' ? `.${baseHost}` : '')) || undefined
  setCookie(event, COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    domain: cookieDomain,
    path: '/',
    maxAge: 0
  })
}

export function getAdminSession(event: H3Event): AdminSessionPayload | null {
  const raw = getCookie(event, COOKIE_NAME)
  if (!raw) return null

  const secret = process.env.ADMIN_SESSION_SECRET || ''
  if (!secret) return null

  const parts = raw.split('.')
  if (parts.length !== 2) return null

  const [payloadB64, signature] = parts
  const expectedSig = sign(payloadB64, secret)
  if (expectedSig !== signature) return null

  try {
    const payloadStr = base64UrlDecode(payloadB64)
    const payload = JSON.parse(payloadStr) as AdminSessionPayload

    const now = Math.floor(Date.now() / 1000)
    if (!payload?.email) return null
    if (typeof payload.exp !== 'number') return null
    if (payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}

export function requireAdminSession(event: H3Event) {
  const session = getAdminSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Não autorizado'
    })
  }

  return session
}
