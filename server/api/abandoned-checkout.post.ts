import { defineEventHandler, readBody } from 'h3'
import prisma from '#root/server/db/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const email = String(body?.email || '').trim().toLowerCase() || null
  const phone = String(body?.phone || body?.telefone || '').trim() || null
  const product = String(body?.product || body?.produto || '').trim() || null
  const status = String(body?.status || 'started').trim() || 'started'

  await (prisma as any).abandonedCheckout.create({
    data: {
      email,
      phone,
      product,
      status
    },
    select: { id: true }
  })

  return { ok: true }
})
