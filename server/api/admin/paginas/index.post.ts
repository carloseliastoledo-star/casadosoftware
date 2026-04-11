import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const prismaAny = prisma as any

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
  const conteudo = conteudoRaw ?? null
  const publicado = Boolean(body?.publicado)
  const showInFooter = Boolean(body?.showInFooter)
  const footerOrder = body?.footerOrder === null || body?.footerOrder === undefined || body?.footerOrder === ''
    ? null
    : Number(body.footerOrder)

  if (!titulo) throw createError({ statusCode: 400, statusMessage: 'Título obrigatório' })
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug obrigatório' })
  if (slug.length < 2) throw createError({ statusCode: 400, statusMessage: 'Slug inválido' })

  try {
    const pagina = await prismaAny.pagina.create({
      data: {
        titulo,
        slug,
        conteudo,
        publicado,
        showInFooter,
        footerOrder
      },
      select: {
        id: true,
        titulo: true,
        slug: true,
        conteudo: true,
        publicado: true,
        showInFooter: true,
        footerOrder: true,
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
