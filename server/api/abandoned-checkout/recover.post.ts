import { defineEventHandler, readBody } from 'h3'
import prisma from '#root/server/db/prisma'
import { normalizeBrazilPhone } from '../../utils/whatsapp'
import { sendUpsellWhatsApp } from '../../utils/upsell'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const email = String(body?.email || '').trim().toLowerCase() || null
    const rawPhone = String(body?.phone || body?.telefone || '').trim()
    const phone = normalizeBrazilPhone(rawPhone) || rawPhone || null
    const product = String(body?.product || '').trim() || null
    const createdSince = new Date(Date.now() - 48 * 60 * 60 * 1000)

    if (!email && !phone) {
      return { ok: true, skipped: true }
    }

    const lead = await (prisma as any).abandonedCheckout.findFirst({
      where: {
        status: { notIn: ['recovered'] },
        createdAt: { gte: createdSince },
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, phone: true, product: true }
    })

    if (lead) {
      await (prisma as any).abandonedCheckout.update({
        where: { id: lead.id },
        data: {
          status: 'recovered',
          recoveredAt: new Date()
        },
        select: { id: true }
      })

      console.log('[ABANDONED_CAPTURE] recovered:', lead.id)

      const upsellPhone = phone || lead.phone
      const upsellProduct = product || lead.product
      if (upsellPhone && upsellProduct) {
        sendUpsellWhatsApp(upsellPhone, upsellProduct).catch(() => {})
      }
    }

    return { ok: true }
  } catch (error) {
    console.error('[ABANDONED_RECOVER_ERROR]', error)
    return { ok: true }
  }
})
