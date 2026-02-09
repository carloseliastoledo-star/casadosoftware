import { defineEventHandler, createError } from 'h3'
import prisma from '../../db/prisma'
import { requireCustomerSession } from '../../utils/customerSession'
import { getStoreContext, whereForStore } from '../../utils/store'

export default defineEventHandler(async (event) => {
  try {
    const session = requireCustomerSession(event)
    const ctx = getStoreContext()

    const findMany = (prisma as any)?.order?.findMany
    if (typeof findMany !== 'function') {
      console.error('[customer-orders] prisma.order.findMany invalid', {
        hasOrder: Boolean((prisma as any)?.order),
        orderType: typeof (prisma as any)?.order,
        findManyType: typeof findMany
      })
      throw createError({ statusCode: 500, statusMessage: 'Falha interna ao buscar pedidos' })
    }

    const orders = await (prisma as any).order.findMany({
      where: whereForStore({ customerId: session.customerId }, ctx) as any,
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        numero: true,
        status: true,
        storeSlug: true,
        criadoEm: true,
        pagoEm: true,
        produto: { select: { id: true, nome: true, slug: true } },
        licencas: { select: { id: true, chave: true, status: true } }
      }
    })

    return { ok: true, orders }
  } catch (err: any) {
    const statusCode = Number(err?.statusCode || 500)
    const message = err?.statusMessage || (err?.message ? String(err.message) : String(err))
    console.error('[customer-orders] error', { statusCode, message })

    if (statusCode >= 400 && statusCode < 500) throw err
    throw createError({ statusCode: 500, statusMessage: `Erro interno ao buscar pedidos: ${message}` })
  }
})
