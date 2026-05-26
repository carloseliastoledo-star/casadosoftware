import { defineEventHandler, createError, getHeader } from 'h3'
import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
  const apiKey = getHeader(event, 'x-internal-api-key')
  const expected = process.env.INTERNAL_API_KEY

  if (!expected || apiKey !== expected) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const now = new Date()

  const { count } = await (prisma as any).blogPost.updateMany({
    where: {
      status: 'scheduled',
      scheduledAt: { lte: now }
    },
    data: {
      status: 'published',
      publicado: true,
      publishedAt: now,
      atualizadoEm: now
    }
  })

  console.log(`[publish-scheduled] published ${count} posts at ${now.toISOString()}`)

  return { ok: true, published: count, at: now.toISOString() }
})
