import { defineEventHandler, readBody } from 'h3'
import prisma from '#root/server/db/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const email = String(body?.email || '').trim().toLowerCase() || null
  const phone = String(body?.phone || body?.telefone || '').trim() || null
  const product = String(body?.product || body?.produto || '').trim() || null
  const status = String(body?.status || 'started').trim() || 'started'
  const source = String(body?.source || 'checkout').trim() || 'checkout'
  const createdSince = new Date(Date.now() - 24 * 60 * 60 * 1000)

  if (!email && !phone) {
    return { ok: true, skipped: true }
  }

  const existing = await (prisma as any).abandonedCheckout.findFirst({
    where: {
      product,
      status: { in: ['started', 'abandoned', 'contacted'] },
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
    await (prisma as any).abandonedCheckout.update({
      where: { id: existing.id },
      data: {
        email,
        phone,
        product,
        status,
        source
      },
      select: { id: true }
    })

    return { ok: true, updated: true }
  }

  await (prisma as any).abandonedCheckout.create({
    data: {
      email,
      phone,
      product,
      status,
      source
    },
    select: { id: true }
  })

  return { ok: true }
})
