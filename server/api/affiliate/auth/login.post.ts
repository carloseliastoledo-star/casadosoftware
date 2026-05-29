import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { verifyPassword } from '../../../utils/password'
import { setAffiliateSession } from '../../../utils/affiliateSession'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Email inválido' })
  }

  if (!password) {
    throw createError({ statusCode: 400, statusMessage: 'Senha obrigatória' })
  }

  const affiliate = await (prisma as any).affiliate.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true, isActive: true }
  })

  if (!affiliate?.passwordHash || !affiliate.isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Credenciais inválidas' })
  }

  const ok = verifyPassword(password, affiliate.passwordHash)
  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: 'Credenciais inválidas' })
  }

  setAffiliateSession(event, { affiliateId: affiliate.id, email: affiliate.email })

  return { ok: true }
})
