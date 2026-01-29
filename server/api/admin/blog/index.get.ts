import { defineEventHandler, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  try {
    const posts = await (prisma as any).blogPost.findMany({
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        titulo: true,
        slug: true,
        publicado: true,
        criadoEm: true,
        atualizadoEm: true
      }
    })

    return { ok: true, posts }
  } catch (err: any) {
    const message = String(err?.message || '')
    const code = String(err?.code || '')

    if (code === 'P2021' || message.includes('does not exist') || message.includes("doesn't exist")) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Banco de dados desatualizado (migração pendente). Rode as migrations em produção.'
      })
    }

    throw err
  }
})
