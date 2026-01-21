import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { hashPassword } from '../../../utils/password'
import { setCustomerSession } from '../../../utils/customerSession'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')
  const nome = body?.nome ? String(body.nome).trim() : null
  const whatsapp = body?.whatsapp ? String(body.whatsapp).trim() : null
  const cpf = body?.cpf ? String(body.cpf).trim() : null

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Email inválido' })
  }

  if (!password || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Senha deve ter pelo menos 6 caracteres' })
  }

  const existing = await prisma.customer.findUnique({ where: { email } })

  if (existing?.passwordHash) {
    throw createError({ statusCode: 409, statusMessage: 'Cliente já cadastrado. Faça login.' })
  }

  const passwordHash = hashPassword(password)

  const customer = await prisma.customer.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      nome,
      whatsapp,
      cpf
    },
    update: {
      passwordHash,
      nome,
      whatsapp,
      cpf
    },
    select: { id: true, email: true, nome: true }
  })

  setCustomerSession(event, { customerId: customer.id, email: customer.email })

  return { ok: true, customer }
})
