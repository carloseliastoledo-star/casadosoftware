import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const orders = await prisma.order.findMany({
    orderBy: { criadoEm: 'desc' },
    take: 200,
    select: {
      id: true,
      numero: true,
      status: true,
      criadoEm: true,
      pagoEm: true,
      emailEnviadoEm: true,
      mercadoPagoPaymentId: true,
      produto: { select: { id: true, nome: true, slug: true } },
      customer: { select: { id: true, email: true, nome: true, whatsapp: true, cpf: true } },
      licencas: { select: { id: true, chave: true, status: true } }
    }
  })

  return { ok: true, orders }
})
