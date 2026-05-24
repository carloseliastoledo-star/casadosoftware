import { defineEventHandler, createError } from 'h3'
import prisma from '../../../../db/prisma'
import { sendEmail } from '../../../../services/emailService'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id

    console.log('[send-checkout-email] leadId:', id)

    // Buscar lead no banco
    const leads = await prisma.$queryRawUnsafe(`
      SELECT * FROM Office365TrialLead WHERE id = ? LIMIT 1
    `, id)

    if (!leads || leads.length === 0) {
      console.log('[send-checkout-email] lead not found')
      throw createError({
        statusCode: 404,
        statusMessage: 'Lead não encontrado'
      })
    }

    const lead = leads[0]

    if (!lead.email) {
      console.log('[send-checkout-email] lead has no email')
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead não possui e-mail'
      })
    }

    if (!lead.checkoutUrl) {
      console.log('[send-checkout-email] lead has no checkoutUrl')
      throw createError({
        statusCode: 400,
        statusMessage: 'Gere o link de checkout antes de enviar o e-mail'
      })
    }

    if (lead.status === 'PAID') {
      console.log('[send-checkout-email] lead already paid')
      throw createError({
        statusCode: 400,
        statusMessage: 'Este lead já está marcado como pago'
      })
    }

    const nome = lead.name || lead.nome || 'Cliente'

    // Gerar conteúdo do e-mail
    const subject = 'Finalize seu Office 365 após o teste gratuito'

    const text = `Olá, ${nome}.

Seu teste do Office 365 foi liberado.

Para continuar usando após o período de teste, finalize o pagamento pelo link abaixo:

${lead.checkoutUrl}

Após a confirmação do pagamento, seu acesso poderá permanecer ativo conforme as condições da oferta contratada.

Importante: caso utilize arquivos em nuvem, recomendamos manter backup periódico dos seus documentos.

Atenciosamente,
Casa do Software`

    const html = `<p>Olá, <strong>${nome}</strong>.</p>
<p>Seu teste do Office 365 foi liberado.</p>
<p>Para continuar usando após o período de teste, finalize o pagamento pelo link abaixo:</p>
<p><a href="${lead.checkoutUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Finalizar pagamento</a></p>
<p>Após a confirmação do pagamento, seu acesso poderá permanecer ativo conforme as condições da oferta contratada.</p>
<p><em>Importante: caso utilize arquivos em nuvem, recomendamos manter backup periódico dos seus documentos.</em></p>
<p>Atenciosamente,<br>Casa do Software</p>`

    // Enviar e-mail
    const emailResult = await sendEmail({
      to: lead.email,
      subject,
      html,
      text
    })

    if (!emailResult.success) {
      console.log('[send-checkout-email] email failed:', emailResult.error)
      throw createError({
        statusCode: 500,
        statusMessage: emailResult.error || 'Erro ao enviar e-mail'
      })
    }

    console.log('[send-checkout-email] email sent successfully')

    // Atualizar status para PAYMENT_SENT
    await prisma.$executeRawUnsafe(`
      UPDATE Office365TrialLead 
      SET status = 'PAYMENT_SENT', updatedAt = NOW()
      WHERE id = ?
    `, id)

    return {
      success: true,
      message: 'E-mail enviado com sucesso'
    }

  } catch (error: any) {
    console.error('[send-checkout-email] error:', error.message)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao enviar e-mail de checkout'
    })
  }
})
