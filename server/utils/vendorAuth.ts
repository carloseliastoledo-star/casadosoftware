import crypto from 'crypto'
import { createError } from 'h3'

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

type VendorTokenPayload = {
  email: string
  iat: number
  exp: number
}

export function generateVendorToken(email: string) {
  const secret = String(process.env.VENDOR_DASHBOARD_SECRET || '').trim()
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'VENDOR_DASHBOARD_SECRET não configurado' })
  }

  const now = Math.floor(Date.now() / 1000)
  const payload: VendorTokenPayload = {
    email: String(email || '').trim().toLowerCase(),
    iat: now,
    exp: now + 60 * 60 * 24 * 30
  }

  const payloadStr = JSON.stringify(payload)
  const payloadB64 = base64UrlEncode(payloadStr)
  const signature = sign(payloadB64, secret)

  return `${payloadB64}.${signature}`
}

export function verifyVendorToken(token: string, email: string) {
  const secret = String(process.env.VENDOR_DASHBOARD_SECRET || '').trim()
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'VENDOR_DASHBOARD_SECRET não configurado' })
  }

  const raw = String(token || '').trim()
  const parts = raw.split('.')
  if (parts.length !== 2) return { ok: false as const }

  const [payloadB64, signature] = parts
  const expectedSig = sign(payloadB64, secret)
  if (expectedSig !== signature) return { ok: false as const }

  try {
    const payloadStr = base64UrlDecode(payloadB64)
    const payload = JSON.parse(payloadStr) as VendorTokenPayload

    const now = Math.floor(Date.now() / 1000)
    const expectedEmail = String(email || '').trim().toLowerCase()

    if (!payload?.email || payload.email !== expectedEmail) return { ok: false as const }
    if (typeof payload.exp !== 'number') return { ok: false as const }
    if (payload.exp < now) return { ok: false as const }

    return { ok: true as const, payload }
  } catch {
    return { ok: false as const }
  }
}
