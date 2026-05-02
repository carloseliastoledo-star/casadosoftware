import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import prisma from '#root/server/db/prisma'
import { sendWhatsAppText } from '../../utils/whatsapp'

// TODO: REMOVER MODO DE TESTE APÓS VALIDAR INTEGRAÇÃO WHATSAPP

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
    // ── MODO DE TESTE TEMPORÁRIO ─────────────────────────────────────────────
    // Ignora filtros de tempo, status e checkoutUrl. Valida apenas telefone.
    // TODO: REMOVER APÓS CONFIRMAR QUE WHATSAPP ESTÁ FUNCIONANDO
    const leads = await (prisma as any).abandonedCheckout.findMany({
      where: {
        phone: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        phone: true
      }
    })

    console.log('[ABANDONED_AUTOMATION] found:', leads.length)

    let sent = 0
    let skipped = 0

    for (const lead of leads) {
      try {
        if (!lead.phone) {
          skipped++
          continue
        }

        const message = `Olá! Teste automático da Casa do Software. Se você recebeu esta mensagem, a integração WhatsApp está funcionando.`
        const result = await sendWhatsAppText(lead.phone, message)

        if (!result.success) {
          console.error('[ABANDONED_AUTOMATION_ERROR]', { id: lead.id, error: result.error })
          skipped++
          continue
        }

        sent++
        console.log('[ABANDONED_AUTOMATION] sent:', lead.id)
      } catch (error) {
        console.error('[ABANDONED_AUTOMATION_ERROR]', error)
        skipped++
      }
    }
    // ── FIM MODO DE TESTE ────────────────────────────────────────────────────

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
