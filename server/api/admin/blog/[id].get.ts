import { defineEventHandler, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(event.context.params?.id || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })

  let post: any = null
  try {
    post = await (prisma as any).blogPost.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        slug: true,
        html: true,
        publicado: true,
        criadoEm: true,
        atualizadoEm: true
      }
    })
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

  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post não encontrado' })

  return { ok: true, post }
})
