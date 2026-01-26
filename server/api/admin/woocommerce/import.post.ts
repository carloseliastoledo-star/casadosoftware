import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { wooGetOrders } from '../../../utils/woocommerceClient'

const STATE_KEY = 'woo_orders_365d'

function toIsoAfter365Days(): string {
  const d = new Date()
  d.setDate(d.getDate() - 365)
  return d.toISOString()
}

function parseMoney(input: unknown): number | null {
  const raw = typeof input === 'string' ? input : String(input ?? '')
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  let body: any = {}
  try {
    body = await readBody(event)
  } catch (err: any) {
    const status = Number(err?.statusCode || err?.status || 0)
    const msg = String(err?.statusMessage || err?.message || '')
    if (status !== 415 && !msg.toLowerCase().includes('unsupported media type')) {
      throw err
    }
    body = {}
  }

  const pagesPerRunRaw = Number(body?.pagesPerRun ?? 3)
  const pagesPerRun = Number.isFinite(pagesPerRunRaw) ? Math.max(1, Math.min(25, Math.floor(pagesPerRunRaw))) : 3

  const perPageRaw = Number(body?.perPage ?? 100)
  const perPage = Number.isFinite(perPageRaw) ? Math.max(10, Math.min(100, Math.floor(perPageRaw))) : 100

  const forceRestart = Boolean(body?.forceRestart)

  const afterIso = typeof body?.after === 'string' && body.after.trim() ? body.after.trim() : toIsoAfter365Days()

  let state = await prisma.wooImportState.findUnique({ where: { key: STATE_KEY } })

  if (!state || forceRestart) {
    state = await prisma.wooImportState.upsert({
      where: { key: STATE_KEY },
      create: {
        key: STATE_KEY,
        resource: 'orders',
        after: new Date(afterIso),
        nextPage: 1,
        done: false
      },
      update: {
        resource: 'orders',
        after: new Date(afterIso),
        nextPage: 1,
        done: false
      }
    })
  }

  if (state.done) {
    return {
      ok: true,
      done: true,
      nextPage: state.nextPage,
      processedOrders: 0,
      createdOrders: 0,
      updatedOrders: 0,
      upsertedCustomers: 0
    }
  }

  let processedOrders = 0
  let createdOrders = 0
  let updatedOrders = 0
  let upsertedCustomers = 0

  let page = state.nextPage
  const after = state.after ? state.after.toISOString() : afterIso

  for (let i = 0; i < pagesPerRun; i++) {
    const orders = await wooGetOrders({ after, page, per_page: perPage })

    if (!orders || orders.length === 0) {
      state = await prisma.wooImportState.update({
        where: { key: STATE_KEY },
        data: { done: true }
      })
      break
    }

    for (const o of orders) {
      const email = String(o?.billing?.email || '').trim().toLowerCase()
      if (!email) {
        continue
      }

      const first = String(o?.billing?.first_name || '').trim()
      const last = String(o?.billing?.last_name || '').trim()
      const nome = String([first, last].filter(Boolean).join(' ')).trim() || null
      const whatsapp = String(o?.billing?.phone || '').trim() || null

      const customer = await prisma.customer.upsert({
        where: { email },
        create: {
          email,
          nome,
          whatsapp,
          wcCustomerId: o.customer_id ? Number(o.customer_id) : null
        },
        update: {
          ...(nome ? { nome } : {}),
          ...(whatsapp ? { whatsapp } : {}),
          ...(o.customer_id ? { wcCustomerId: Number(o.customer_id) } : {})
        },
        select: { id: true }
      })
      upsertedCustomers++

      const total = parseMoney(o.total)
      const currency = String(o.currency || '').trim() || null
      const createdAt = o.date_created ? new Date(o.date_created) : new Date()

      const existing = await prisma.wooOrder.findUnique({ where: { wcOrderId: Number(o.id) }, select: { id: true } })

      const order = await prisma.wooOrder.upsert({
        where: { wcOrderId: Number(o.id) },
        create: {
          wcOrderId: Number(o.id),
          status: String(o.status || 'unknown'),
          total,
          currency,
          criadoEm: createdAt,
          customerId: customer.id
        },
        update: {
          status: String(o.status || 'unknown'),
          total,
          currency,
          criadoEm: createdAt,
          customerId: customer.id
        },
        select: { id: true }
      })

      if (existing) updatedOrders++
      else createdOrders++

      const items = Array.isArray(o.line_items) ? o.line_items : []

      await prisma.wooOrderItem.deleteMany({ where: { orderId: order.id } })

      if (items.length > 0) {
        await prisma.wooOrderItem.createMany({
          data: items.map((it) => ({
            orderId: order.id,
            name: it?.name ? String(it.name) : null,
            quantity: it?.quantity === undefined || it?.quantity === null ? null : Number(it.quantity),
            total: parseMoney(it?.total)
          }))
        })
      }

      processedOrders++
    }

    page++

    state = await prisma.wooImportState.update({
      where: { key: STATE_KEY },
      data: { nextPage: page }
    })
  }

  return {
    ok: true,
    done: state.done,
    after: state.after,
    nextPage: state.nextPage,
    processedOrders,
    createdOrders,
    updatedOrders,
    upsertedCustomers
  }
})
