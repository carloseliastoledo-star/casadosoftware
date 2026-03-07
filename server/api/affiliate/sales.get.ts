import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'
import { requireAffiliateSession } from '../../utils/affiliateSession'

export default defineEventHandler(async (event) => {
  const session = requireAffiliateSession(event)

  const orders = await (prisma as any).order.findMany({
    where: {
      affiliateId: session.affiliateId,
      status: 'PAID'
    },
    orderBy: { pagoEm: 'desc' },
    take: 200,
    select: {
      id: true,
      numero: true,
      status: true,
      totalAmount: true,
      currency: true,
      pagoEm: true,
      criadoEm: true,
      produto: {
        select: {
          id: true,
          nome: true,
          slug: true
        }
      }
    }
  })

  return { ok: true, orders }
})
