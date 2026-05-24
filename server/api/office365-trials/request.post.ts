import { defineEventHandler, createError, readBody, getHeader, getRequestHeaders } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const headers = getRequestHeaders(event)

    // Validação dos campos obrigatórios
    const { name, email, whatsapp, usageType, systemType, acceptTerms } = body
    
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nome é obrigatório'
      })
    }
    
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'E-mail inválido'
      })
    }
    
    if (!whatsapp || typeof whatsapp !== 'string' || whatsapp.trim().length < 10) {
      throw createError({
        statusCode: 400,
        statusMessage: 'WhatsApp é obrigatório'
      })
    }
    
    if (!usageType || typeof usageType !== 'string' || !['pessoal', 'empresa', 'estudante'].includes(usageType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tipo de uso inválido'
      })
    }
    
    if (!systemType || typeof systemType !== 'string' || !['Windows', 'Mac'].includes(systemType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Sistema inválido'
      })
    }
    
    if (!acceptTerms || acceptTerms !== true) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Você deve aceitar os termos'
      })
    }
    
    // Verificar se já existe teste ativo para o mesmo email ou whatsapp
    const existingLead = await prisma.$queryRawUnsafe(`
      SELECT * FROM Office365TrialLead 
      WHERE (email = ? OR whatsapp = ?) 
      AND status IN ('PENDING', 'ACCESS_SENT', 'ACTIVE', 'PAYMENT_SENT')
      AND trialExpiresAt > NOW()
      LIMIT 1
    `, email.trim(), whatsapp.trim())
    
    if (existingLead && existingLead.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Você já possui um teste ativo. Entre em contato conosco se precisar de ajuda.'
      })
    }
    
    // Calcular data de expiração (7 dias a partir de agora)
    const trialStartAt = new Date()
    const trialExpiresAt = new Date(trialStartAt)
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 7)

    // Capturar metadados da requisição
    const clientIp = headers['x-forwarded-for'] || headers['x-real-ip'] || event.node.req.socket.remoteAddress || 'unknown'
    const userAgent = headers['user-agent'] || 'unknown'
    const referrer = headers['referer'] || headers['referrer'] || 'unknown'
    const landingPage = referrer

    // Capturar parâmetros UTM (podem vir do body ou da query string)
    const utmSource = body.utm_source || 'unknown'
    const utmMedium = body.utm_medium || 'unknown'
    const utmCampaign = body.utm_campaign || 'unknown'
    const utmContent = body.utm_content || 'unknown'
    const utmTerm = body.utm_term || 'unknown'
    const gclid = body.gclid || null
    const fbclid = body.fbclid || null

    // Criar lead no banco
    const leadId = crypto.randomUUID()
    await prisma.$executeRawUnsafe(`
      INSERT INTO Office365TrialLead (
        id, name, email, whatsapp, usageType, systemType,
        status, trialStartAt, trialExpiresAt, createdAt, updatedAt,
        ip, userAgent, referrer, landingPage,
        utmSource, utmMedium, utmCampaign, utmContent, utmTerm, gclid, fbclid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      leadId,
      name.trim(),
      email.trim(),
      whatsapp.trim(),
      usageType,
      systemType,
      'PENDING',
      trialStartAt,
      trialExpiresAt,
      trialStartAt,
      trialStartAt,
      clientIp,
      userAgent,
      referrer,
      landingPage,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      gclid,
      fbclid
    )

    // Chamar endpoint interno para reservar licença
    let licenseReserved = false
    let licenseEmail = null
    let licensePassword = null

    try {
      const reserveResponse = await $fetch('/api/internal/office365-reserve-license' as any, {
        method: 'POST',
        body: {
          leadId,
          customerName: name.trim(),
          customerEmail: email.trim(),
          source: 'landing_page'
        }
      })

      if (reserveResponse.success && reserveResponse.licenseSend) {
        licenseReserved = reserveResponse.licenseSend.status === 'SENT'
        licenseEmail = reserveResponse.licenseSend.licenseEmail

        // Se a licença foi reservada e temos dados, enviar e-mail
        if (licenseReserved && reserveResponse.licenseData) {
          licensePassword = reserveResponse.licenseData.password

          // Enviar e-mail com dados da licença
          try {
            const { sendEmail } = await import('../../services/emailService')
            await sendEmail({
              to: email.trim(),
              subject: 'Seu acesso de teste Office 365 - Casa do Software',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #0078d4;">Seu acesso de teste Office 365</h2>
                  <p>Olá <strong>${name.trim()}</strong>,</p>
                  <p>Parabéns! Aqui estão os dados do seu acesso de teste por 7 dias:</p>
                  
                  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Produto:</strong> Office 365 Teste Grátis</p>
                    <p><strong>E-mail Microsoft:</strong> ${reserveResponse.licenseData.email}</p>
                    <p><strong>Senha provisória:</strong> <code style="background: #e0e0e0; padding: 2px 5px; border-radius: 3px;">${licensePassword}</code></p>
                    <p><strong>Tipo:</strong> ${reserveResponse.licenseData.licenseType}</p>
                    ${reserveResponse.licenseData.tenantDomain ? `<p><strong>Domínio:</strong> ${reserveResponse.licenseData.tenantDomain}</p>` : ''}
                  </div>
                  
                  <h3 style="color: #0078d4;">Instruções de Login:</h3>
                  <ol>
                    <li>Acesse <a href="https://portal.office.com" style="color: #0078d4;">https://portal.office.com</a></li>
                    <li>Use o e-mail da licença acima para fazer login</li>
                    <li>Use a senha provisória informada</li>
                    <li>Se solicitado, configure o <strong>Microsoft Authenticator</strong> no seu celular</li>
                    <li>Recomendamos trocar a senha após o primeiro acesso</li>
                  </ol>
                  
                  <h3 style="color: #0078d4;">Sobre o Microsoft Authenticator:</h3>
                  <p>O Office 365 pode exigir autenticação em dois fatores. Se solicitado:</p>
                  <ul>
                    <li>Baixe o app Microsoft Authenticator na App Store ou Google Play</li>
                    <li>Escaneie o QR Code apresentado na tela</li>
                    <li>Confirme o login no app</li>
                  </ul>
                  
                  <hr style="margin: 30px 0;">
                  
                  <p><strong>Importante:</strong></p>
                  <ul>
                    <li>Seu teste é válido por 7 dias a partir de hoje</li>
                    <li>Após o período de teste, você pode adquirir uma licença permanente</li>
                    <li>Guarde estes dados em local seguro</li>
                  </ul>
                  
                  <hr style="margin: 30px 0;">
                  
                  <p>Se tiver dúvidas ou precisar de ajuda, entre em contato conosco:</p>
                  <p>
                    <strong>E-mail:</strong> suporte@casadosoftware.com.br<br>
                    <strong>WhatsApp:</strong> (11) 99999-9999
                  </p>
                  
                  <p style="margin-top: 30px;">Atenciosamente,<br><strong>Equipe Casa do Software</strong></p>
                  
                  <p style="font-size: 12px; color: #666; margin-top: 20px;">
                    Este é um e-mail automático. Por favor, não responda.
                  </p>
                </div>
              `
            })
            console.log('[api/office365-trial/request] Email sent successfully')
          } catch (emailError: any) {
            console.error('[api/office365-trial/request] Email error:', emailError)
            // Continuar mesmo se falhar o envio de e-mail
          }
        }
      }
    } catch (reserveError: any) {
      console.error('[api/office365-trial/request] Reserve license error:', reserveError)
      // Continuar mesmo se falhar a reserva
    }

    return {
      success: true,
      message: licenseReserved
        ? 'Solicitação recebida. Enviamos as instruções de acesso no seu e-mail.'
        : 'No momento todos os testes foram utilizados. Fale com nosso suporte para liberar uma conta.',
      licenseReserved,
      licenseEmail
    }
    
  } catch (error: any) {
    console.error('[api/office365-trial/request] error:', error)
    
    // Se já for um erro criado, retorna ele
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao processar solicitação'
    })
  }
})
