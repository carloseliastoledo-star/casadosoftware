import { defineEventHandler, createError } from 'h3'
import prisma from '../../db/prisma'
import { requireCustomerSession } from '../../utils/customerSession'
import { getStoreContext, whereForStore } from '../../utils/store'

export default defineEventHandler(async (event) => {
  try {
    const session = requireCustomerSession(event)
    const ctx = getStoreContext()

    // Debug logs
    const host = event.headers.get('host') || event.headers.get('x-forwarded-host') || 'unknown'
    console.log('[customer-orders] DEBUG', { 
      host, 
      customerId: session.customerId, 
      storeSlug: ctx.storeSlug, 
      includeLegacy: ctx.includeLegacy,
      storeSlugEnv: process.env.STORE_SLUG,
      siteUrl: process.env.SITE_URL
    })

    const findMany = (prisma as any)?.order?.findMany
    if (typeof findMany !== 'function') {
      console.error('[customer-orders] prisma.order.findMany invalid', {
        hasOrder: Boolean((prisma as any)?.order),
        orderType: typeof (prisma as any)?.order,
        findManyType: typeof findMany
      })
      throw createError({ statusCode: 500, statusMessage: 'Falha interna ao buscar pedidos' })
    }

    const where = whereForStore({ customerId: session.customerId }, ctx) as any
    console.log('[customer-orders] QUERY where:', JSON.stringify(where))

    const orders = await (prisma as any).order.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        numero: true,
        status: true,
        storeSlug: true,
        criadoEm: true,
        pagoEm: true,
        Produto: { select: { id: true, nome: true, slug: true } },
        Licenca: { select: { id: true, chave: true, status: true } }
      }
    })

    console.log('[customer-orders] RESULT orders count:', orders.length)

    return { ok: true, orders }
  } catch (err: any) {
    const statusCode = Number(err?.statusCode || 500)
    const message = err?.statusMessage || (err?.message ? String(err.message) : String(err))
    console.error('[customer-orders] error', { statusCode, message })

    if (statusCode >= 400 && statusCode < 500) throw err
    throw createError({ statusCode: 500, statusMessage: `Erro interno ao buscar pedidos: ${message}` })
  }
})
