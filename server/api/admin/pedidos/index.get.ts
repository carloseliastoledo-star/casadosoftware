import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const orders = await (prisma as any).order.findMany({
    orderBy: { criadoEm: 'desc' },
    take: 200,
    select: {
      id: true,
      numero: true,
      status: true,
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
