import { defineEventHandler, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession.js'

export default defineEventHandler(async (event) => {
  const session = requireAdminSession(event)

  try {
    const me = await prisma.adminUser.findUnique({ where: { email: session.email } })
    if (!me || me.role !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: 'Sem permissão' })
    }

    return prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
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
