import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import prisma from '#root/server/db/prisma'
import { sendWhatsAppText } from '../../utils/whatsapp'

const MAX_PER_RUN = 5
const FALLBACK_URL = 'https://casadosoftware.com.br/checkout'
const WINDOW_MS = 48 * 60 * 60 * 1000

const MESSAGES: Record<number, (url: string) => string> = {
  0: (url) => `⚠️ Oi! Vi que você iniciou a ativação do seu Office, mas não finalizou.\n\nSe precisar, posso te ajudar agora mesmo 👍\n\n👉 Finalizar ativação:\n${url}\n\n💡 Leva menos de 2 minutos e já sai funcionando no seu computador.`,
  1: (url) => `🔥 Seu acesso ainda está reservado, mas pode sair a qualquer momento.\n\nHoje muita gente está ativando esse pacote.\n\n👉 Garantir agora:\n${url}\n\nSe tiver dúvida, me chama 👍`,
  2: (url) => `💻 Ainda não conseguiu ativar?\n\nPosso te ajudar passo a passo aqui 👇\n\n👉 Finalizar:\n${url}\n\n🎁 Posso te mandar um guia simples se precisar.`,
  3: (url) => `🎁 Última chance!\n\nSeu acesso pode expirar e o valor pode mudar.\n\n👉 Ativar agora:\n${url}`
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
  if (lead.repliedAt) return 'replied'
  if (lead.recoveredAt) return 'completed'
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
  const isTest = String(query?.test || '') === 'true'
  const isDryRun = String(query?.dryRun || '') === 'true'

  if (!process.env.AUTOMATION_SECRET || secret !== process.env.AUTOMATION_SECRET) {
    setResponseStatus(event, 401)
    return { ok: false, error: 'unauthorized' }
  }

  if (process.env.ABANDONED_CHECKOUT_ENABLED !== 'true') {
    return { ok: false, error: 'automation_disabled' }
  }

  if (isTest) {
    const testPhone = process.env.TEST_WHATSAPP_PHONE
    if (!testPhone) return { ok: false, error: 'TEST_WHATSAPP_PHONE_not_set' }
    if (!isDryRun) {
      const msg = MESSAGES[0](FALLBACK_URL)
      const result = await sendWhatsAppText(testPhone, msg)
      console.log('[ABANDONED_AUTOMATION] test sent to:', testPhone, '| result:', result)
    }
    return { ok: true, test: true, dryRun: isDryRun, phone: testPhone }
  }

  try {
    const since = new Date(Date.now() - WINDOW_MS)

    const leads = await (prisma as any).abandonedCheckout.findMany({
      where: {
        phone: { not: null },
        status: { in: ['abandoned', 'pending', 'messaged'] },
        createdAt: { gte: since },
        repliedAt: null,
        recoveredAt: null,
        messageStep: { lt: 4 }
      },
      orderBy: { createdAt: 'asc' },
      take: MAX_PER_RUN * 4,
      select: {
        id: true,
        phone: true,
        product: true,
        checkoutUrl: true,
        status: true,
        messageStep: true,
        lastMessageAt: true,
        repliedAt: true,
        recoveredAt: true,
        createdAt: true
      }
    })

    console.log('[ABANDONED_AUTOMATION] found:', leads.length)

    let sent = 0
    let skipped = 0
    const reasons: Record<string, number> = {}
    const now = Date.now()

    for (const lead of leads) {
      if (sent >= MAX_PER_RUN) break

      try {
        const reason = skipReason(lead, now)
        if (reason) {
          reasons[reason] = (reasons[reason] ?? 0) + 1
          skipped++
          continue
        }

        const step = lead.messageStep ?? 0
        const product = lead.product || 'office-365'
        const url = lead.checkoutUrl || `${FALLBACK_URL}?product=${product}`
        const message = MESSAGES[step](url)

        if (!isDryRun) {
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
        }

        sent++
        console.log('[ABANDONED_AUTOMATION] sent:', lead.id, '| step:', step + 1, '| dryRun:', isDryRun)
      } catch (error) {
        console.error('[ABANDONED_AUTOMATION_ERROR]', error)
        reasons['exception'] = (reasons['exception'] ?? 0) + 1
        skipped++
      }
    }

    console.log('[ABANDONED_AUTOMATION] sent:', sent, '| skipped:', skipped, '| reasons:', reasons)
    return { ok: true, found: leads.length, sent, skipped, reasons, dryRun: isDryRun }
  } catch (err: any) {
    console.error('🔥 AUTOMATION ERROR:', err)
    return {
      ok: false,
      error: err.message || 'automation_failed',
      stack: err.stack
    }
  }
})
