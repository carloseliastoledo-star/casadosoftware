import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(event.context.params?.id || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })

  const body = await readBody(event)

  const titulo = String(body?.titulo || '').trim()
  const slug = String(body?.slug || '').trim()
  const html = body?.html != null ? String(body.html) : null
  const publicado = Boolean(body?.publicado)

  if (!titulo) throw createError({ statusCode: 400, statusMessage: 'Título obrigatório' })
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug obrigatório' })

  try {
    const post = await (prisma as any).blogPost.update({
      where: { id },
      data: {
        titulo,
        slug,
        html,
        publicado
      },
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

    return { ok: true, post }
  } catch (err: any) {
    const message = String(err?.message || '')
    throw createError({
      statusCode: 500,
      statusMessage: message.includes('Unknown column') || message.includes("doesn't exist")
        ? 'Banco de dados desatualizado (migração pendente). Rode as migrations em produção.'
        : (err?.message || 'Server Error')
    })
  }
})
