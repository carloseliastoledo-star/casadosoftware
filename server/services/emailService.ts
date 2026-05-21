import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, text } = options

  // Validar variáveis de ambiente
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom = process.env.SMTP_FROM

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
    return {
      success: false,
      error: 'SMTP não configurado. Configure as variáveis SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM'
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })

    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      html,
      text
    })

    return { success: true }
  } catch (error: any) {
    console.error('[emailService] Erro ao enviar e-mail:', error.message)
    return {
      success: false,
      error: error.message || 'Erro ao enviar e-mail'
    }
  }
}
