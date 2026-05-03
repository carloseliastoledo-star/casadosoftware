import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import prisma from '#root/server/db/prisma'
import { sendWhatsAppText } from '../../utils/whatsapp'

const MAX_SENDS_PER_RUN = 10
const LOCK_TIMEOUT_MS = 10 * 60 * 1000 // 10 minutos
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

// Status que não devem receber mensagens
const COMPLETED_STATUSES = ['paid', 'completed', 'converted', 'recovered', 'replied']

function skipReason(lead: any, now: number): string | null {
  if (!lead.phone) return 'no_phone'
  if (!lead.checkoutUrl) return 'no_checkout_url'
  
  const status = lead.status?.toLowerCase()
  if (COMPLETED_STATUSES.includes(status)) return `status_${status}`
  
  if (lead.lockedAt) {
    const lockedTime = new Date(lead.lockedAt).getTime()
    if (now - lockedTime < LOCK_TIMEOUT_MS) return 'locked'
  }
  
  const step = lead.messageStep ?? 0
  if (step >= 4) return 'already_sent'
  
  // Verificar intervalo entre mensagens
  const ref = step === 0
    ? new Date(lead.createdAt).getTime()
    : lead.lastSentAt ? new Date(lead.lastSentAt).getTime() : null
  
  if (ref === null) return 'no_timestamp'
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
      console.log('[abandoned-checkout] test sent to:', testPhone, '| result:', result)
    }
    return { ok: true, test: true, dryRun: isDryRun, phone: testPhone }
  }

  try {
    const since = new Date(Date.now() - WINDOW_MS)

    const leads = await (prisma as any).abandonedCheckout.findMany({
      where: {
        phone: { not: null },
        status: { notIn: COMPLETED_STATUSES },
        createdAt: { gte: since },
        repliedAt: null,
        recoveredAt: null,
        messageStep: { lt: 4 },
        lockedAt: null // Não trazer registros travados
      },
      orderBy: { createdAt: 'asc' },
      take: MAX_SENDS_PER_RUN * 3,
      select: {
        id: true,
        phone: true,
        product: true,
        checkoutUrl: true,
        status: true,
        messageStep: true,
        lastMessageAt: true,
        lastSentAt: true,
        lockedAt: true,
        repliedAt: true,
        recoveredAt: true,
        createdAt: true
      }
    })

    console.log('[abandoned-checkout] found:', leads.length)

    let sent = 0
    let skipped = 0
    const reasons: Record<string, number> = {}
    const now = Date.now()
    const phonesSent = new Set<string>() // Deduplicação por telefone

    for (const lead of leads) {
      if (sent >= MAX_SENDS_PER_RUN) break

      try {
        const reason = skipReason(lead, now)
        if (reason) {
          reasons[reason] = (reasons[reason] ?? 0) + 1
          skipped++
          console.log('[abandoned-checkout] skipped', { orderId: lead.id, phone: lead.phone, reason })
          continue
        }

        // Deduplicação por telefone na mesma execução
        if (phonesSent.has(lead.phone)) {
          reasons['phone_already_sent'] = (reasons['phone_already_sent'] ?? 0) + 1
          skipped++
          console.log('[abandoned-checkout] skipped', { orderId: lead.id, phone: lead.phone, reason: 'phone_already_sent' })
          continue
        }

        const step = lead.messageStep ?? 0
        const product = lead.product || 'office-365'
        const url = lead.checkoutUrl || `${FALLBACK_URL}?product=${product}`
        const message = MESSAGES[step](url)

        console.log('[abandoned-checkout] sending', { orderId: lead.id, phone: lead.phone, step })

        if (!isDryRun) {
          // Travar antes de enviar
          await (prisma as any).abandonedCheckout.update({
            where: { id: lead.id },
            data: { lockedAt: new Date() },
            select: { id: true }
          })

          const result = await sendWhatsAppText(lead.phone, message)

          if (!result.success) {
            // Remover trava em caso de erro
            await (prisma as any).abandonedCheckout.update({
              where: { id: lead.id },
              data: { lockedAt: null },
              select: { id: true }
            })
            console.error('[abandoned-checkout] send_failed', { orderId: lead.id, phone: lead.phone, step, error: result.error })
            reasons['send_failed'] = (reasons['send_failed'] ?? 0) + 1
            skipped++
            continue
          }

          // Atualizar após envio bem-sucedido
          await (prisma as any).abandonedCheckout.update({
            where: { id: lead.id },
            data: {
              messageStep: step + 1,
              lastMessageAt: new Date(),
              lastSentAt: new Date(),
              lockedAt: null, // Remover trava
              status: step === 0 ? 'messaged' : lead.status,
              ...(step === 0 ? { contactedAt: new Date() } : {})
            },
            select: { id: true }
          })

          phonesSent.add(lead.phone)
          console.log('[abandoned-checkout] sent', { orderId: lead.id, phone: lead.phone, nextStep: step + 1 })
        } else {
          // Dry run: simular envio
          phonesSent.add(lead.phone)
          console.log('[abandoned-checkout] sent (dryRun)', { orderId: lead.id, phone: lead.phone, step, dryRun: true })
        }

        sent++
      } catch (error) {
        // Remover trava em caso de exceção
        try {
          await (prisma as any).abandonedCheckout.update({
            where: { id: lead.id },
            data: { lockedAt: null },
            select: { id: true }
          })
        } catch (updateError) {
          // Ignorar erro ao remover trava
        }
        console.error('[abandoned-checkout] exception', { orderId: lead.id, error })
        reasons['exception'] = (reasons['exception'] ?? 0) + 1
        skipped++
      }
    }

    console.log('[abandoned-checkout] summary', { sent, skipped, reasons, dryRun: isDryRun })
    return { ok: true, found: leads.length, sent, skipped, reasons, dryRun: isDryRun }
  } catch (err: any) {
    console.error('[abandoned-checkout] error', err)
    return {
      ok: false,
      error: err.message || 'automation_failed',
      stack: err.stack
    }
  }
})
