import { defineEventHandler, readBody } from 'h3'
import prisma from '#root/server/db/prisma'
import { normalizeBrazilPhone } from '../../utils/whatsapp'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('[WHATSAPP_REPLY] payload:', JSON.stringify(body))

    const rawPhone =
      body?.phone ||
      body?.from ||
      body?.sender?.phone ||
      body?.message?.from ||
      ''

    const phone = normalizeBrazilPhone(String(rawPhone))

    if (!phone) {
      return { success: true, skipped: 'no_phone' }
    }

    const lead = await (prisma as any).abandonedCheckout.findFirst({
      where: {
        phone,
        status: { in: ['contacted_1', 'contacted_2', 'contacted_3', 'contacted_4'] }
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true }
    })

    if (!lead) {
      return { success: true, skipped: 'no_lead' }
    }

    await (prisma as any).abandonedCheckout.update({
      where: { id: lead.id },
      data: {
        status: 'replied',
        repliedAt: new Date()
      },
      select: { id: true }
    })

    console.log('[WHATSAPP_REPLY] marked replied:', lead.id, '| phone:', phone)
    return { success: true }
  } catch (error) {
    console.error('[WHATSAPP_REPLY_ERROR]', error)
    return { success: true }
  }
})
