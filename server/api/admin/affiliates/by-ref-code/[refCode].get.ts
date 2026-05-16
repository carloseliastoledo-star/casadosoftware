import { defineEventHandler, createError } from 'h3'
import prisma from '../../../../db/prisma.js'
import { requireAdminSession } from '../../../../utils/adminSession.js'
import { getStoreContext } from '../../../../utils/store.js'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)
  if (storeSlug === 'international') {
    throw createError({ statusCode: 404, statusMessage: 'Afiliado não encontrado' })
  }

  const code = String((event.context.params as any)?.refCode || '').trim()
  if (!code) throw createError({ statusCode: 400, statusMessage: 'code obrigatório' })

  const affiliateRaw = await (prisma as any).affiliate.findUnique({
    where: { code },
    select: { id: true, name: true, email: true, code: true, commissionRate: true, isActive: true, createdAt: true }
  })
  
  // Mapear code para refCode para compatibilidade
  const affiliate = affiliateRaw ? { ...affiliateRaw, refCode: affiliateRaw.code } : null

  if (!affiliate) throw createError({ statusCode: 404, statusMessage: 'Afiliado não encontrado' })

  return { ok: true, affiliate }
})
