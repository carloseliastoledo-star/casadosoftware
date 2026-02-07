import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { hashPassword } from '../../../utils/password'
import { setCustomerSession } from '../../../utils/customerSession'
import { getStoreContext } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  const REGISTER_HANDLER_VERSION = 'register-v2'

  try {
    const { storeSlug } = getStoreContext()
    const body = await readBody(event)

    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')
    const nome = body?.nome ? String(body.nome).trim() : null
    const whatsapp = body?.whatsapp ? String(body.whatsapp).trim() : null
    const cpf = body?.cpf ? String(body.cpf).trim() : null

    console.warn('[customer-register] request', { email, storeSlug })

    if (!email || !email.includes('@')) {
      throw createError({ statusCode: 400, statusMessage: 'Email inválido' })
    }

    if (!password || password.length < 6) {
      throw createError({ statusCode: 400, statusMessage: 'Senha deve ter pelo menos 6 caracteres' })
    }

    if (!storeSlug) {
      throw createError({ statusCode: 500, statusMessage: 'STORE_SLUG não configurado' })
    }

    const existing = await prisma.customer.findUnique({ where: { email_storeSlug: { email, storeSlug } } })

    if (existing?.passwordHash) {
      throw createError({ statusCode: 409, statusMessage: 'Cliente já cadastrado. Faça login.' })
    }

    const passwordHash = hashPassword(password)

    const customer = await prisma.customer.upsert({
      where: { email_storeSlug: { email, storeSlug } },
      create: {
        email,
        storeSlug,
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

    console.warn('[customer-register] ok', { customerId: customer.id, storeSlug })

    return { ok: true, customer }
  } catch (err: any) {
    const statusCode = Number(err?.statusCode || 500)
    if (statusCode >= 400 && statusCode < 500) {
      throw err
    }

    const message = err?.statusMessage || (err?.message ? String(err.message) : String(err))
    console.error('[customer-register] erro', { message })

    throw createError({
      statusCode: 500,
      statusMessage: `Erro interno ao criar conta (${REGISTER_HANDLER_VERSION}): ${message}`
    })
  }
})
