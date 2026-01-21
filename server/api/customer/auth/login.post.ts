import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { verifyPassword } from '../../../utils/password'
import { setCustomerSession } from '../../../utils/customerSession'

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

  const customer = await prisma.customer.findUnique({
    where: { email },
    select: { id: true, email: true, nome: true, passwordHash: true }
  })

  if (!customer?.passwordHash) {
    throw createError({ statusCode: 401, statusMessage: 'Credenciais inválidas' })
  }

  const ok = verifyPassword(password, customer.passwordHash)
  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: 'Credenciais inválidas' })
  }

  setCustomerSession(event, { customerId: customer.id, email: customer.email })

  return { ok: true, customer: { id: customer.id, email: customer.email, nome: customer.nome } }
})
