import { defineEventHandler, getQuery } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'
import { getStoreContext, whereForStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const ctx = getStoreContext(event)

  const q = getQuery(event)
  const period = String((q as any)?.period || '').trim().toLowerCase()

  const now = Date.now()
  const startMs =
    period === 'day'
      ? now - 24 * 60 * 60 * 1000
      : period === 'week'
        ? now - 7 * 24 * 60 * 60 * 1000
        : period === 'month'
          ? now - 30 * 24 * 60 * 60 * 1000
          : null

  const paidAfter = startMs ? new Date(startMs) : null

  const paidWhere = whereForStore(
    {
      status: 'PAID',
      pagoEm: paidAfter ? { gte: paidAfter } : undefined
    },
    ctx
  ) as any

  const listWhere = whereForStore(
    {
      pagoEm: paidAfter ? { gte: paidAfter } : undefined
    },
    ctx
  ) as any

  const orders = await (prisma as any).order.findMany({
    where: listWhere,
    orderBy: { criadoEm: 'desc' },
    take: 200,
    select: {
      id: true,
      numero: true,
      status: true,
      storeSlug: true,
      trafficSourceType: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      utmTerm: true,
      utmContent: true,
      gclid: true,
      fbclid: true,
      referrer: true,
      landingPage: true,
      criadoEm: true,
      pagoEm: true,
      emailEnviadoEm: true,
      fulfillmentStatus: true,
      fulfillmentError: true,
      fulfillmentUpdatedAt: true,
      mercadoPagoPaymentId: true,
      mercadoPagoPaymentTypeId: true,
      mercadoPagoPaymentMethodId: true,
      produto: { select: { id: true, nome: true, slug: true } },
      customer: { select: { id: true, email: true, nome: true, whatsapp: true, cpf: true } },
      licencas: { select: { id: true, chave: true, status: true } }
    }
  })

  const summaryAgg = await (prisma as any).order.aggregate({
    where: paidWhere,
    _count: { id: true },
    _sum: { totalAmount: true }
  })

  const summary = {
    countPaid: Number(summaryAgg?._count?.id || 0),
    totalPaid: Number(summaryAgg?._sum?.totalAmount || 0)
  }

  return { ok: true, orders, summary }
})
