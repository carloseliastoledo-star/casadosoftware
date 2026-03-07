import { defineEventHandler, readBody, createError } from 'h3'
import { sendMail } from '../utils/mailer'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(input: string) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const whatsapp = body?.whatsapp != null ? String(body.whatsapp).trim() : ''
  const channel = body?.channel != null ? String(body.channel).trim() : ''
  const message = body?.message != null ? String(body.message).trim() : ''

  if (!name) throw createError({ statusCode: 400, statusMessage: 'Nome é obrigatório' })
  if (!email) throw createError({ statusCode: 400, statusMessage: 'Email é obrigatório' })
  if (!isValidEmail(email)) throw createError({ statusCode: 400, statusMessage: 'Email inválido' })

  if (name.length > 120) throw createError({ statusCode: 400, statusMessage: 'Nome muito longo' })
  if (email.length > 255) throw createError({ statusCode: 400, statusMessage: 'Email muito longo' })
  if (whatsapp.length > 40) throw createError({ statusCode: 400, statusMessage: 'WhatsApp muito longo' })
  if (channel.length > 255) throw createError({ statusCode: 400, statusMessage: 'Canal muito longo' })
  if (message.length > 2000) throw createError({ statusCode: 400, statusMessage: 'Mensagem muito longa' })

  const to = String(process.env.AFFILIATE_APPLICATION_TO || process.env.SMTP_FROM || '').trim()
  if (!to || !to.includes('@')) {
    throw createError({ statusCode: 500, statusMessage: 'Destino de e-mail não configurado' })
  }

  await sendMail({
    to,
    subject: 'Nova inscrição de afiliado',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin: 0 0 12px;">Nova inscrição de afiliado</h2>
        <p style="margin: 0 0 8px;"><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin: 0 0 8px;"><strong>WhatsApp:</strong> ${escapeHtml(whatsapp || '-')}</p>
        <p style="margin: 0 0 8px;"><strong>Canal/Site:</strong> ${escapeHtml(channel || '-')}</p>
        <p style="margin: 16px 0 8px;"><strong>Mensagem:</strong></p>
        <div style="white-space: pre-wrap; background: #f3f4f6; padding: 12px; border-radius: 8px;">
          ${escapeHtml(message || '-')}
        </div>
        <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">Enviado via /affiliate/inscrever</p>
      </div>
    `.trim()
  })

  return { ok: true }
})
