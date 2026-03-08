import { defineEventHandler, createError } from 'h3'
import prisma from '../../db/prisma.js'
import { decodeHtmlEntities } from '../../utils/decodeHtmlEntities.js'

export default defineEventHandler(async (event) => {
  const slug = String(event.context.params?.slug || '').trim()
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug obrigatório' })

  let post: any = null
  try {
    post = await (prisma as any).blogPost.findUnique({
      where: { slug },
      select: {
        titulo: true,
        slug: true,
        featuredImage: true,
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
      throw createError({ statusCode: 404, statusMessage: 'Post não encontrado' })
    }

    throw err
  }

  if (!post || !post.publicado) {
    throw createError({ statusCode: 404, statusMessage: 'Post não encontrado' })
  }

  if (post?.html) {
    post.html = decodeHtmlEntities(post.html)
  }

  return { ok: true, post }
})
