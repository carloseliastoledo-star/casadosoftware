import { defineEventHandler, readBody } from 'h3'
import prisma from '#root/server/db/prisma'
import { normalizeBrazilPhone } from '../utils/whatsapp'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const email = String(body?.email || '').trim().toLowerCase() || null
  const rawPhone = String(body?.phone || body?.telefone || '').trim()
  const phone = normalizeBrazilPhone(rawPhone) || rawPhone || null
  const product = String(body?.product || body?.produto || '').trim() || null
  const checkoutUrl = String(body?.checkoutUrl || '').trim() || null
  const status = String(body?.status || 'started').trim() || 'started'
  const source = String(body?.source || 'checkout').trim() || 'checkout'
  const createdSince = new Date(Date.now() - 24 * 60 * 60 * 1000)

  if (!email && !phone) {
    return { ok: true, skipped: true }
  }

  console.log('[ABANDONED_CAPTURE]', { email, phone, product, status })

  const existing = await (prisma as any).abandonedCheckout.findFirst({
    where: {
      product,
      status: { notIn: ['recovered'] },
      createdAt: { gte: createdSince },
      OR: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true }
  })

  if (existing) {
    const updated = await (prisma as any).abandonedCheckout.update({
      where: { id: existing.id },
      data: {
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
        ...(product ? { product } : {}),
        ...(checkoutUrl ? { checkoutUrl } : {}),
        status,
        source
      },
      select: { id: true }
    })
    return { ok: true, updated: true, id: updated.id }
  }

  const created = await (prisma as any).abandonedCheckout.create({
    data: {
      email,
      phone,
      product,
      checkoutUrl,
      status,
      source
    },
    select: { id: true }
  })

  return { ok: true, id: created.id }
})
