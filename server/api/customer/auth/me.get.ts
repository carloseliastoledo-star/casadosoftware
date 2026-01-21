import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireCustomerSession } from '../../../utils/customerSession'

export default defineEventHandler(async (event) => {
  const session = requireCustomerSession(event)

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    select: { id: true, email: true, nome: true, whatsapp: true, cpf: true }
  })

  return { ok: true, customer }
})
