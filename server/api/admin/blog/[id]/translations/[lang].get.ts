import { defineEventHandler, createError } from 'h3'
import prisma from '../../../../../db/prisma.js'
import { requireAdminSession } from '../../../../../utils/adminSession.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(event.context.params?.id || '')
  const lang = String(event.context.params?.lang || '').trim().toLowerCase()
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  if (!lang) throw createError({ statusCode: 400, statusMessage: 'lang obrigatório' })

  try {
    const translation = await (prisma as any).blogPostTranslation.findFirst({
      where: { postId: id, lang },
      select: {
        id: true,
        postId: true,
        lang: true,
        titulo: true,
        featuredImage: true,
        excerpt: true,
        html: true,
        criadoEm: true,
        atualizadoEm: true
      }
    })

    return { ok: true, translation: translation || null }
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
