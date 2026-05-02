import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import prisma from '#root/server/db/prisma'
import { sendWhatsAppText } from '../../utils/whatsapp'

const MAX_PER_RUN = 20

const COMPLETED_STATUSES = ['paid', 'completed', 'converted', 'recovered', 'replied']

const MESSAGES: Record<number, (url: string) => string> = {
  0: (url) => `⚠️ Você esqueceu sua ativação 😱\n\nSeu pedido ainda está reservado.\n\nFinalize aqui:\n${url}\n\nEntrega imediata após pagamento ⚡`,
  1: (url) => `🔥 Sua licença ainda está disponível\n\nMuitos clientes perdem a oferta por não finalizar o pagamento.\n\nConclua aqui:\n${url}`,
  2: (url) => `💻 Ainda sem seu Office?\n\nEvite travamentos, erros e perda de produtividade.\n\nAtive agora em poucos minutos:\n${url}`,
  3: (url) => `🎁 Última chance\n\nSua condição especial ainda está disponível hoje.\n\nFinalize aqui:\n${url}\n\nDepois disso o valor pode subir.`
}

function getWaitMs(step: number): number {
  if (step === 0) return 5 * 60 * 1000
  if (step === 1) return 30 * 60 * 1000
  if (step === 2) return 2 * 60 * 60 * 1000
  if (step === 3) return 24 * 60 * 60 * 1000
  return Infinity
}

function skipReason(lead: any, now: number): string | null {
  if (!lead.phone) return 'no_phone'
  if (COMPLETED_STATUSES.includes(lead.status)) return 'completed'
  const step = lead.messageStep ?? 0
  if (step >= 4) return 'already_sent'
  const ref = step === 0
    ? new Date(lead.createdAt).getTime()
    : lead.lastMessageAt ? new Date(lead.lastMessageAt).getTime() : null
  if (ref === null) return 'too_early'
  if (now - ref < getWaitMs(step)) return 'too_early'
  return null
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const secret = String(query?.secret || '')

  if (!process.env.AUTOMATION_SECRET || secret !== process.env.AUTOMATION_SECRET) {
    setResponseStatus(event, 401)
    return { ok: false, error: 'unauthorized' }
  }

  try {
    const leads = await (prisma as any).abandonedCheckout.findMany({
      where: {
        phone: { not: null },
        status: { notIn: COMPLETED_STATUSES },
        messageStep: { lt: 4 }
      },
      orderBy: { createdAt: 'asc' },
      take: MAX_PER_RUN,
      select: {
        id: true,
        phone: true,
        product: true,
        checkoutUrl: true,
        status: true,
        messageStep: true,
        lastMessageAt: true,
        createdAt: true
      }
    })

    console.log('[ABANDONED_AUTOMATION] found:', leads.length)

    let sent = 0
    let skipped = 0
    const reasons: Record<string, number> = {}
    const now = Date.now()

    for (const lead of leads) {
      try {
        const reason = skipReason(lead, now)
        if (reason) {
          reasons[reason] = (reasons[reason] ?? 0) + 1
          skipped++
          continue
        }

        const step = lead.messageStep ?? 0
        const product = lead.product || 'office-365'
        const url = lead.checkoutUrl || `https://casadosoftware.com.br/checkout?product=${product}`
        const message = MESSAGES[step](url)

        const result = await sendWhatsAppText(lead.phone, message)

        if (!result.success) {
          console.error('[ABANDONED_AUTOMATION_ERROR]', { id: lead.id, step, error: result.error })
          reasons['send_failed'] = (reasons['send_failed'] ?? 0) + 1
          skipped++
          continue
        }

        await (prisma as any).abandonedCheckout.update({
          where: { id: lead.id },
          data: {
            messageStep: step + 1,
            lastMessageAt: new Date(),
            status: 'messaged',
            ...(step === 0 ? { contactedAt: new Date() } : {})
          },
          select: { id: true }
        })

        sent++
        console.log('[ABANDONED_AUTOMATION] sent:', lead.id, '| step:', step + 1, '| phone:', lead.phone)
      } catch (error) {
        console.error('[ABANDONED_AUTOMATION_ERROR]', error)
        reasons['exception'] = (reasons['exception'] ?? 0) + 1
        skipped++
      }
    }

    console.log('[ABANDONED_AUTOMATION] sent:', sent, '| skipped:', skipped, '| reasons:', reasons)
    return { ok: true, found: leads.length, sent, skipped, reasons }
  } catch (err: any) {
    console.error('🔥 AUTOMATION ERROR:', err)
    return {
      ok: false,
      error: err.message || 'automation_failed',
      stack: err.stack
    }
  }
})
