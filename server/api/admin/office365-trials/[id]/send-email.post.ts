import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '../../../../db/prisma'
import { sendEmail } from '../../../../services/emailService'
import { generateDeliveryMessage, generateDay5Message, generateDay7Message, generatePostExpirationMessage } from '../../../../services/office365TrialMessages'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    const body = await readBody(event)
    const { type } = body

    if (!type || !['delivery', 'day5', 'day7', 'expired'].includes(type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tipo de e-mail inválido'
      })
    }

    // Buscar lead no banco
    const leads = await prisma.$queryRawUnsafe(`
      SELECT * FROM Office365TrialLead WHERE id = ? LIMIT 1
    `, id)

    if (!leads || leads.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lead não encontrado'
      })
    }

    const lead = leads[0]

    if (!lead.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead não possui e-mail'
      })
    }

    let subject = ''
    let message = ''

    if (type === 'delivery') {
      // Validar login e senha
      if (!lead.microsoftLogin || !lead.temporaryPassword) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Preencha login Microsoft e senha provisória antes de enviar o e-mail de entrega.'
        })
      }

      subject = 'Seu teste do Office 365 foi liberado'
      const tutorialUrl = process.env.OFFICE365_TRIAL_TUTORIAL_URL || 'https://casadosoftware.com.br/tutoriais'
      message = generateDeliveryMessage(lead, tutorialUrl)

      // Atualizar status para ACCESS_SENT se estiver PENDING
      if (lead.status === 'PENDING') {
        await prisma.$executeRawUnsafe(`
          UPDATE Office365TrialLead 
          SET status = 'ACCESS_SENT', updatedAt = NOW()
          WHERE id = ?
        `, id)
      }
    } else if (type === 'day5') {
      // Validar checkoutUrl
      if (!lead.checkoutUrl) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Preencha o link de checkout antes de enviar cobrança.'
        })
      }

      subject = 'Seu teste do Office 365 termina em 2 dias'
      message = generateDay5Message(lead)
    } else if (type === 'day7') {
      // Validar checkoutUrl
      if (!lead.checkoutUrl) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Preencha o link de checkout antes de enviar cobrança.'
        })
      }

      subject = 'Seu teste gratuito do Office 365 termina hoje'
      message = generateDay7Message(lead)
    } else if (type === 'expired') {
      // Validar checkoutUrl
      if (!lead.checkoutUrl) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Preencha o link de checkout antes de enviar cobrança.'
        })
      }

      subject = 'Seu teste do Office 365 expirou - Reative seu acesso'
      message = generatePostExpirationMessage(lead)
    }

    // Converter mensagem para HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0078d4; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Casa do Software</h1>
          </div>
          <div class="content">
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <div class="footer">
            <p>© 2026 Casa do Software. Todos os direitos reservados.</p>
            <p>Esta é uma oferta promocional da Casa do Software e não está afiliada à Microsoft Corporation.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Enviar e-mail
    const result = await sendEmail({
      to: lead.email,
      subject,
      html,
      text: message
    })

    if (!result.success) {
      throw createError({
        statusCode: 500,
        statusMessage: result.error || 'Erro ao enviar e-mail'
      })
    }

    return {
      success: true,
      message: 'E-mail enviado com sucesso.'
    }

  } catch (error: any) {
    console.error('[api/admin/office365-trials/[id]/send-email] error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao enviar e-mail'
    })
  }
})
