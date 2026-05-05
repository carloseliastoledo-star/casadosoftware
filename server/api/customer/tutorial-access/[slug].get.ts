import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { getCustomerSession } from '../../../utils/customerSession'
import { getStoreContext, whereForStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  const session = getCustomerSession(event)

  if (!session) {
    return { ok: true, allowed: false, reason: 'not_logged_in' }
  }

  const { storeSlug } = getStoreContext()

  try {
    const order = await (prisma as any).order.findFirst({
      where: whereForStore(
        {
          customerId: session.customerId,
          pagoEm: { not: null }
        },
        { storeSlug }
      ) as any,
      select: { id: true }
    })

    if (!order) {
      return { ok: true, allowed: false, reason: 'no_paid_order' }
    }

    return { ok: true, allowed: true, reason: null }
  } catch (err: any) {
    console.error('[tutorial-access] error:', err?.message || err)
    return { ok: true, allowed: false, reason: 'error' }
  }
})
