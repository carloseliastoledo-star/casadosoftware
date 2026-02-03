import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import DOMPurify from 'isomorphic-dompurify'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body = await readBody(event)

  const titulo = String(body?.titulo || '').trim()
  const slug = String(body?.slug || '').trim()
  const conteudoRaw = body?.conteudo != null ? String(body.conteudo) : null
  const conteudo = conteudoRaw != null ? DOMPurify.sanitize(conteudoRaw) : null
  const publicado = Boolean(body?.publicado)

  if (!titulo) throw createError({ statusCode: 400, statusMessage: 'Título obrigatório' })
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug obrigatório' })

  const pagina = await prisma.pagina.create({
    data: {
      titulo,
      slug,
      conteudo,
      publicado
    },
    select: {
      id: true,
      titulo: true,
      slug: true,
      conteudo: true,
      publicado: true,
      criadoEm: true,
      atualizadoEm: true
    }
  })

  return { ok: true, pagina }
})
