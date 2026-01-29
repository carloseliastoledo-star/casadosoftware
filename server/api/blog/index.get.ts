import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma.js'

export default defineEventHandler(async () => {
  try {
    const posts = await (prisma as any).blogPost.findMany({
      where: { publicado: true },
      orderBy: { criadoEm: 'desc' },
      select: {
        titulo: true,
        slug: true,
        criadoEm: true,
        atualizadoEm: true
      }
    })

    return { ok: true, posts }
  } catch (err: any) {
    const message = String(err?.message || '')
    const code = String(err?.code || '')

    if (code === 'P2021' || message.includes('does not exist') || message.includes("doesn't exist")) {
      return { ok: true, posts: [] }
    }

    throw err
  }
})
