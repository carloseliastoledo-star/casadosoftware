import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'
import { getStoreContext, whereForStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const ctx = getStoreContext()

  const orders = await (prisma as any).order.findMany({
    where: whereForStore({}, ctx) as any,
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

  return { ok: true, orders }
})
