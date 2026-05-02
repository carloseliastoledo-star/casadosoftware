import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import prisma from '#root/server/db/prisma'
import { sendWhatsAppText } from '../../utils/whatsapp'

const MESSAGES: Record<number, (url: string) => string> = {
  0: (url) => `⚠️ Você esqueceu sua ativação 😱\n\nSeu pedido ainda está reservado.\n\nFinalize aqui:\n${url}\n\nEntrega imediata após pagamento ⚡`,
  1: (url) => `🔥 Sua licença ainda está disponível\n\nMuitos clientes perdem a oferta por não finalizar o pagamento.\n\nConclua aqui:\n${url}`,
  2: (url) => `💻 Ainda sem seu Office?\n\nEvite travamentos, erros e perda de produtividade.\n\nAtive agora em poucos minutos:\n${url}`,
  3: (url) => `🎁 Última chance\n\nSua condição especial ainda está disponível hoje.\n\nFinalize aqui:\n${url}\n\nDepois disso o valor pode subir.`
}

const STEP_STATUS: Record<number, string> = {
  0: 'contacted_1',
  1: 'contacted_2',
  2: 'contacted_3',
  3: 'contacted_4'
}

function isReadyToSend(lead: any, now: number): boolean {
  const step = lead.messageStep ?? 0
  const createdAt = new Date(lead.createdAt).getTime()
  const lastAt = lead.lastMessageAt ? new Date(lead.lastMessageAt).getTime() : null

  if (step === 0) return now - createdAt >= 5 * 60 * 1000
  if (step === 1) return lastAt !== null && now - lastAt >= 30 * 60 * 1000
  if (step === 2) return lastAt !== null && now - lastAt >= 2 * 60 * 60 * 1000
  if (step === 3) return lastAt !== null && now - lastAt >= 24 * 60 * 60 * 1000
  return false
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
        status: { notIn: ['replied', 'recovered'] },
        messageStep: { lt: 4 }
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
      select: {
        id: true,
        phone: true,
        product: true,
        checkoutUrl: true,
        messageStep: true,
        lastMessageAt: true,
        createdAt: true
      }
    })

    console.log('[ABANDONED_AUTOMATION] found:', leads.length)

    let sent = 0
    let skipped = 0
    const now = Date.now()

    for (const lead of leads) {
      try {
        if (!isReadyToSend(lead, now)) {
          skipped++
          continue
        }

        const step = lead.messageStep ?? 0
        const product = lead.product || 'office-365'
        const url = lead.checkoutUrl || `https://casadosoftware.com.br/checkout?product=${product}`
        const messageFn = MESSAGES[step]
        if (!messageFn) { skipped++; continue }

        const message = messageFn(url)
        const result = await sendWhatsAppText(lead.phone, message)

        if (!result.success) {
          console.error('[ABANDONED_AUTOMATION_ERROR]', { id: lead.id, error: result.error })
          skipped++
          continue
        }

        const nextStep = step + 1
        await (prisma as any).abandonedCheckout.update({
          where: { id: lead.id },
          data: {
            status: STEP_STATUS[step],
            messageStep: nextStep,
            lastMessageAt: new Date(),
            ...(step === 0 ? { contactedAt: new Date() } : {})
          },
          select: { id: true }
        })

        sent++
        console.log('[ABANDONED_AUTOMATION] sent:', lead.id, '| step:', step + 1)
      } catch (error) {
        console.error('[ABANDONED_AUTOMATION_ERROR]', error)
        skipped++
      }
    }

    return { ok: true, found: leads.length, sent, skipped }
  } catch (err: any) {
    console.error('🔥 AUTOMATION ERROR:', err)
    return {
      ok: false,
      error: err.message || 'automation_failed',
      stack: err.stack
    }
  }
})
