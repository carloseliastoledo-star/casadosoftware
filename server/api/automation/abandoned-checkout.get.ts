import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import prisma from '#root/server/db/prisma'
import { sendWhatsAppText } from '../../utils/whatsapp'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const secret = String(query?.secret || '')

  if (!process.env.AUTOMATION_SECRET || secret !== process.env.AUTOMATION_SECRET) {
    setResponseStatus(event, 401)
    return { ok: false, error: 'unauthorized' }
  }

  try {
    const createdBefore = new Date(Date.now() - 5 * 60 * 1000)
    const leads = await (prisma as any).abandonedCheckout.findMany({
      where: {
        status: 'abandoned',
        phone: { not: null },
        createdAt: { lt: createdBefore }
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
      select: {
        id: true,
        phone: true,
        product: true
      }
    })

    console.log('[ABANDONED_AUTOMATION] leads found:', leads.length)

    let sent = 0

    for (const lead of leads) {
      try {
        const product = lead.product || 'office-365'
        const message = `Você esqueceu sua ativação 😱\n\nSeu Office está pronto para liberar agora:\n\n👉 https://casadosoftware.com.br/checkout?product=${product}\n\nEntrega imediata após pagamento ⚡`
        const result = await sendWhatsAppText(lead.phone, message)

        if (!result.success) {
          console.error('[ABANDONED_AUTOMATION_ERROR]', result.error)
          continue
        }

        await (prisma as any).abandonedCheckout.update({
          where: { id: lead.id },
          data: {
            status: 'contacted',
            contactedAt: new Date()
          },
          select: { id: true }
        })

        sent++
        console.log('[ABANDONED_AUTOMATION] sent:', lead.id)
      } catch (error) {
        console.error('[ABANDONED_AUTOMATION_ERROR]', error)
      }
    }

    return { ok: true, found: leads.length, sent }
  } catch (error) {
    console.error('[ABANDONED_AUTOMATION_ERROR]', error)
    return { ok: false, error: 'automation_failed' }
  }
})
