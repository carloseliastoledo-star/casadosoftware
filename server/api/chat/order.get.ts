import { createError, defineEventHandler, getQuery, setResponseHeader } from 'h3'
import prisma from '../../db/prisma'
import { requireCustomerSession } from '../../utils/customerSession'
import { getStoreContext, whereForStore } from '../../utils/store'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  if (String(useRuntimeConfig(event).public.supportChatEnabled) !== 'true') {
    throw createError({ statusCode: 404 })
  }

  const { customerId } = requireCustomerSession(event)
  const reference = getQuery(event).number
  if (typeof reference !== 'string' || !/^[1-9][0-9]{0,9}$/.test(reference) ||
      Number(reference) > 2147483647) {
    throw createError({ statusCode: 400, statusMessage: 'Informe um número de pedido válido' })
  }

  const orders = await prisma.order.findMany({
    where: whereForStore({ numero: Number(reference), customerId, deletedAt: null }, getStoreContext(event)),
    take: 2,
    select: { numero: true, status: true, pagoEm: true, emailEnviadoEm: true }
  })
  if (orders.length !== 1) {
    throw createError({ statusCode: 404, statusMessage: 'Pedido não localizado. Confira em Minha conta.' })
  }

  const [order] = orders
  const payment = order.status === 'REJECTED' ? 'Pagamento recusado'
    : order.status === 'PAID' && order.pagoEm ? 'Pagamento confirmado'
    : 'Pagamento sem confirmação'

  return {
    number: order.numero,
    payment,
    delivery: order.emailEnviadoEm ? 'Envio de e-mail registrado' : 'Envio de e-mail sem registro'
  }
})
