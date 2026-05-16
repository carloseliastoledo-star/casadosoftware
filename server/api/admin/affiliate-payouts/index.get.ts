import { defineEventHandler, getQuery } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'
import { getStoreContext } from '../../../utils/store.js'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)
  if (storeSlug === 'international') {
    return { ok: true, payouts: [] }
  }

  const q = getQuery(event)
  const status = String((q as any)?.status || '').trim()

  const where: any = {}
  if (status) where.status = status

  const payouts = await (prisma as any).affiliatePayoutRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      affiliateId: true,
      amount: true,
      status: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      affiliate: {
        select: { id: true, name: true, email: true, code: true }
      }
    }
  })

  // Mapear code para refCode nos afiliados para compatibilidade
  const payoutsMapped = payouts.map((p: any) => ({
    ...p,
    affiliate: p.affiliate ? { ...p.affiliate, refCode: p.affiliate.code } : null
  }))

  return { ok: true, payouts: payoutsMapped }
})
