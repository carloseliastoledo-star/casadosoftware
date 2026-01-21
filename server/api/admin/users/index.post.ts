import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession.js'
import { hashPassword } from '../../../utils/password.js'

export default defineEventHandler(async (event) => {
  const session = requireAdminSession(event)

  try {
    const me = await prisma.adminUser.findUnique({ where: { email: session.email } })
    if (!me || me.role !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: 'Sem permissão' })
    }

    const body = await readBody(event)
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')
    const role = String(body?.role || 'editor')

    if (!email || !email.includes('@')) {
      throw createError({ statusCode: 400, statusMessage: 'Email inválido' })
    }

    if (password.length < 8) {
      throw createError({ statusCode: 400, statusMessage: 'Senha deve ter pelo menos 8 caracteres' })
    }

    if (role !== 'admin' && role !== 'editor') {
      throw createError({ statusCode: 400, statusMessage: 'Role inválida' })
    }

    try {
      return await prisma.adminUser.create({
        data: {
          email,
          passwordHash: hashPassword(password),
          role
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true
        }
      })
    } catch {
      throw createError({ statusCode: 409, statusMessage: 'Usuário já existe' })
    }
  } catch (err: any) {
    if (err?.statusCode) {
      throw err
    }

    throw createError({
      statusCode: 501,
      statusMessage: 'Funcionalidade requer migração do banco (tabela AdminUser)'
    })
  }
})
