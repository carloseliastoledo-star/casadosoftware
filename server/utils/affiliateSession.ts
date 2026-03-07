import crypto from 'crypto'
import { createError, getCookie, setCookie, type H3Event } from 'h3'

const COOKIE_NAME = 'affiliate_session'

type AffiliateSessionPayload = {
  affiliateId: number
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

function resolveSecret() {
  return String(process.env.AFFILIATE_SESSION_SECRET || process.env.AFFILIATE_INVITE_SECRET || '').trim()
}

export function setAffiliateSession(event: H3Event, payload: { affiliateId: number; email: string }) {
  const secret = resolveSecret()
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'AFFILIATE_SESSION_SECRET não configurado' })
  }

  const now = Math.floor(Date.now() / 1000)
  const session: AffiliateSessionPayload = {
    affiliateId: payload.affiliateId,
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

export function clearAffiliateSession(event: H3Event) {
  const isProd = process.env.NODE_ENV === 'production'
  setCookie(event, COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 0
  })
}

export function getAffiliateSession(event: H3Event): AffiliateSessionPayload | null {
  const raw = getCookie(event, COOKIE_NAME)
  if (!raw) return null

  const secret = resolveSecret()
  if (!secret) return null

  const parts = raw.split('.')
  if (parts.length !== 2) return null

  const payloadB64 = String(parts[0] || '')
  const signature = String(parts[1] || '')
  if (!payloadB64 || !signature) return null
  const expectedSig = sign(payloadB64, secret)
  if (expectedSig !== signature) return null

  try {
    const payloadStr = base64UrlDecode(payloadB64)
    const payload = JSON.parse(payloadStr) as AffiliateSessionPayload

    const now = Math.floor(Date.now() / 1000)
    if (!payload?.affiliateId || !payload?.email) return null
    if (typeof payload.exp !== 'number') return null
    if (payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}

export function requireAffiliateSession(event: H3Event) {
  const session = getAffiliateSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }
  return session
}
