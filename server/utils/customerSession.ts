import crypto from 'crypto'
import { createError, getCookie, setCookie, type H3Event } from 'h3'

const COOKIE_NAME = 'customer_session'

type CustomerSessionPayload = {
  customerId: string
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

export function setCustomerSession(event: H3Event, payload: { customerId: string; email: string }) {
  const secret = process.env.CUSTOMER_SESSION_SECRET || ''
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'CUSTOMER_SESSION_SECRET não configurado' })
  }

  const now = Math.floor(Date.now() / 1000)
  const session: CustomerSessionPayload = {
    customerId: payload.customerId,
    email: payload.email,
    iat: now,
    exp: now + 60 * 60 * 24 * 30
  }

  const payloadStr = JSON.stringify(session)
  const payloadB64 = base64UrlEncode(payloadStr)
  const signature = sign(payloadB64, secret)

  const isProd = process.env.NODE_ENV === 'production'

  setCookie(event, COOKIE_NAME, `${payloadB64}.${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })

  return session
}

export function clearCustomerSession(event: H3Event) {
  const isProd = process.env.NODE_ENV === 'production'
  setCookie(event, COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 0
  })
}

export function getCustomerSession(event: H3Event): CustomerSessionPayload | null {
  const raw = getCookie(event, COOKIE_NAME)
  if (!raw) return null

  const secret = process.env.CUSTOMER_SESSION_SECRET || ''
  if (!secret) return null

  const parts = raw.split('.')
  if (parts.length !== 2) return null

  const [payloadB64, signature] = parts
  const expectedSig = sign(payloadB64, secret)
  if (expectedSig !== signature) return null

  try {
    const payloadStr = base64UrlDecode(payloadB64)
    const payload = JSON.parse(payloadStr) as CustomerSessionPayload

    const now = Math.floor(Date.now() / 1000)
    if (!payload?.customerId || !payload?.email) return null
    if (typeof payload.exp !== 'number') return null
    if (payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}

export function requireCustomerSession(event: H3Event) {
  const session = getCustomerSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }
  return session
}
