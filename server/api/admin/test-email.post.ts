import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdminSession } from '#root/server/utils/adminSession'
import { sendMail } from '#root/server/utils/mailer'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body = await readBody(event)
  const to = String(body?.to || '').trim()

  if (!to) {
    throw createError({ statusCode: 400, statusMessage: 'Informe o email destino no campo "to"' })
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Teste de email</h2>
      <p>Este é um email de teste enviado em ${new Date().toISOString()}</p>
      <p>Se você recebeu este email, o SMTP está funcionando corretamente.</p>
    </div>
  `.trim()

  try {
    await sendMail({
      to,
      subject: 'Teste SMTP - Casa do Software',
      html
    })

    return { ok: true, message: `Email de teste enviado para ${to}` }
  } catch (err: any) {
    const msg = String(err?.message || err || 'Erro desconhecido')
    console.error('[test-email] Erro:', msg)
    throw createError({ statusCode: 502, statusMessage: `Falha no envio: ${msg}` })
  }
})
