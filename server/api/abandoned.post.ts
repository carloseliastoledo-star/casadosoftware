/**
 * POST /api/abandoned — salva email para recuperação de carrinho
 * Chamado assim que o usuário digita o email no checkout
 */
import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../db/prisma'
import { getStoreContext } from '../utils/store'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { storeSlug } = getStoreContext(event)

  const email     = String(body?.email     || '').trim().toLowerCase()
  const produtoId = String(body?.produtoId || '').trim()

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Email inválido' })
  }

  await (prisma as any).lead.create({
    data: {
      email,
      produtoId: produtoId || null,
      storeSlug: storeSlug || null,
      status: 'abandoned',
    },
    select: { id: true },
  })

  return { ok: true }
})
