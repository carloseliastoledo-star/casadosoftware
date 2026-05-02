import { defineEventHandler, readBody } from 'h3'
import prisma from '#root/server/db/prisma'
import { normalizeBrazilPhone } from '../../utils/whatsapp'

// Status de pagamento/conversão - não devem ser atualizados
const COMPLETED_STATUSES = ['paid', 'completed', 'converted', 'recovered']

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Ignorar eventos de status/delivery/read/sent/ack
    const eventType = body?.event || body?.type || body?.status || ''
    if (/status|delivery|read|sent|ack|message_status/i.test(eventType)) {
      return { ok: true, skipped: 'status_event' }
    }

    // Extrair telefone de múltiplos campos possíveis
    const rawPhone =
      body?.phone ||
      body?.from ||
      body?.sender?.phone ||
      body?.remoteJid ||
      body?.chatId ||
      body?.message?.from ||
      body?.message?.remoteJid ||
      ''

    if (!rawPhone) {
      return { ok: true, skipped: 'no_phone' }
    }

    // Normalizar telefone
    const phone = normalizeBrazilPhone(String(rawPhone))
    if (!phone) {
      return { ok: true, skipped: 'invalid_phone' }
    }

    // Ignorar mensagens enviadas por nós mesmos
    const fromMe = body?.fromMe || body?.me || body?.sender?.me === true || false
    if (fromMe) {
      return { ok: true, skipped: 'from_me' }
    }

    // Buscar checkout mais recente com esse telefone (apenas 1 registro)
    const lead = await (prisma as any).abandonedCheckout.findFirst({
      where: {
        phone,
        status: { notIn: COMPLETED_STATUSES }
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, repliedAt: true }
    })

    if (!lead) {
      return { ok: true, skipped: 'no_lead' }
    }

    // Se já tem repliedAt, não atualizar novamente (idempotente)
    if (lead.repliedAt) {
      return { ok: true, skipped: 'already_replied' }
    }

    // Atualizar apenas repliedAt e lastMessageAt
    await (prisma as any).abandonedCheckout.update({
      where: { id: lead.id },
      data: {
        status: 'replied',
        repliedAt: new Date(),
        lastMessageAt: new Date()
      },
      select: { id: true }
    })

    console.log('[WHATSAPP_REPLY] marked replied:', lead.id, '| phone:', phone)
    return { ok: true, updated: true }
  } catch (error) {
    console.error('[WHATSAPP_REPLY_ERROR]', error)
    return { ok: true, error: 'processing_failed' }
  }
})
