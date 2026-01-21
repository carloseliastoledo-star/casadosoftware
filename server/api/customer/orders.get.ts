import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'
import { requireCustomerSession } from '../../utils/customerSession'

export default defineEventHandler(async (event) => {
  const session = requireCustomerSession(event)

  const orders = await prisma.order.findMany({
    where: { customerId: session.customerId },
    orderBy: { criadoEm: 'desc' },
    select: {
      id: true,
      numero: true,
      status: true,
      criadoEm: true,
      pagoEm: true,
      produto: { select: { id: true, nome: true, slug: true } },
      licencas: { select: { id: true, chave: true, status: true } }
    }
  })

  return { ok: true, orders }
})
