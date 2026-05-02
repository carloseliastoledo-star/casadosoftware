import { defineEventHandler, readBody } from 'h3'
import prisma from '#root/server/db/prisma'
import { normalizeBrazilPhone, sendWhatsAppText } from '../../utils/whatsapp'

const FALLBACK_URL = 'https://casadosoftware.com.br/checkout'

function detectIntent(msg: string): 'help' | 'buy' | 'objection' | 'greeting' | null {
  const m = msg.toLowerCase()
  if (/\b(1|instal)/i.test(m)) return 'help'
  if (/\b(2|compr)/i.test(m)) return 'buy'
  if (/caro|seguro|original|funciona|legitim|pirat|virus|vírus/i.test(m)) return 'objection'
  if (/\b(oi|olá|ola|bom dia|boa tarde|boa noite|hey|hi)\b/i.test(m)) return 'greeting'
  return null
}

function buildReply(intent: 'help' | 'buy' | 'objection' | 'greeting' | null, url: string): string {
  if (intent === 'help') {
    return `Top 👍 vou te ajudar.\n\n👉 Finaliza aqui:\n${url}\n\nDepois me chama que te guio passo a passo.`
  }
  if (intent === 'buy') {
    return `Perfeito 🚀\n\n👉 Finalizar agora:\n${url}\n\nQualquer dúvida estou aqui 👍`
  }
  if (intent === 'objection') {
    return `Boa pergunta 👍\n\n✔ Licença original\n✔ Funciona vitalício\n✔ Suporte incluso\n\n👉 Pode finalizar tranquilo:\n${url}`
  }
  return `Perfeito 👍\n\nMe fala:\n1️⃣ Quer ajuda pra instalar\n2️⃣ Só finalizar a compra`
}

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

    const incomingText = String(
      body?.text ||
      body?.message?.text ||
      body?.body ||
      ''
    ).trim()

    const phone = normalizeBrazilPhone(String(rawPhone))

    if (!phone) {
      return { success: true, skipped: 'no_phone' }
    }

    const lead = await (prisma as any).abandonedCheckout.findFirst({
      where: {
        phone,
        status: { notIn: ['recovered', 'paid', 'completed', 'converted'] }
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, checkoutUrl: true, product: true, repliedAt: true }
    })

    if (!lead) {
      return { success: true, skipped: 'no_lead' }
    }

    const url = lead.checkoutUrl || `${FALLBACK_URL}${lead.product ? `?product=${lead.product}` : ''}`
    const intent = detectIntent(incomingText)
    const reply = buildReply(intent, url)

    await (prisma as any).abandonedCheckout.update({
      where: { id: lead.id },
      data: {
        status: 'replied',
        repliedAt: lead.repliedAt ?? new Date()
      },
      select: { id: true }
    })

    console.log('[WHATSAPP_REPLY] marked replied:', lead.id, '| phone:', phone, '| intent:', intent)

    sendWhatsAppText(phone, reply).catch((err) => {
      console.error('[WHATSAPP_REPLY_SEND_ERROR]', err)
    })

    return { success: true }
  } catch (error) {
    console.error('[WHATSAPP_REPLY_ERROR]', error)
    return { success: true }
  }
})
