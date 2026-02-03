import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import DOMPurify from 'isomorphic-dompurify'
import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body = await readBody(event)

  const titulo = String(body?.titulo || '').trim()
  const rawSlug = String(body?.slug || '').trim()
  const slug = rawSlug
    .toLowerCase()
    .replace(/^\/+/, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '')
  const conteudoRaw = body?.conteudo != null ? String(body.conteudo) : null
  const conteudo = conteudoRaw != null ? DOMPurify.sanitize(conteudoRaw) : null
  const publicado = Boolean(body?.publicado)

  if (!titulo) throw createError({ statusCode: 400, statusMessage: 'Título obrigatório' })
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug obrigatório' })
  if (slug.length < 2) throw createError({ statusCode: 400, statusMessage: 'Slug inválido' })

  try {
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
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw createError({ statusCode: 400, statusMessage: 'Já existe uma página com este slug' })
      }
    }
    throw err
  }
})
