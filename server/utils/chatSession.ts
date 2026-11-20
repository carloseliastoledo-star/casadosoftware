import { createHmac, timingSafeEqual } from 'node:crypto'
import { createError, getCookie, setCookie } from 'h3'
import type { H3Event } from 'h3'

const COOKIE = 'cds_chat_session'
const MAX_AGE = 7 * 24 * 60 * 60

function sign(value: string) {
  const secret = process.env.CUSTOMER_SESSION_SECRET || process.env.CUSTOMER_RESET_SECRET
  if (!secret) {
    throw createError({ statusCode: 503, statusMessage: 'Atendimento temporariamente indisponível' })
  }
  return createHmac('sha256', secret).update('chat-session:' + value).digest('hex')
}

export function setChatSession(event: H3Event, conversationId: string) {
  const value = `${conversationId}.${Math.floor(Date.now() / 1000) + MAX_AGE}`
  setCookie(event, COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/chat',
    maxAge: MAX_AGE
  })
}

export function requireChatSession(event: H3Event, conversationId: string) {
  const parts = (getCookie(event, COOKIE) || '').split('.')
  const [id, expires, signature] = parts
  if (parts.length === 3 && id === conversationId && /^\d+$/.test(expires) &&
      Number(expires) > Date.now() / 1000 && /^[a-f0-9]{64}$/.test(signature)) {
    const expected = sign(`${id}.${expires}`)
    if (timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) return
  }
  throw createError({ statusCode: 404, statusMessage: 'Conversa não encontrada' })
}
