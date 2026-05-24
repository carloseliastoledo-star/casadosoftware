import { defineEventHandler, createError, readBody, getRequestHeaders } from 'h3'
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
    const existingLead = await prisma.$queryRawUnsafe<any[]>(`
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

    // Capturar parâmetros UTM
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
    let licenseEmail: string | null = null
    let licensePassword: string | null = null

    try {
      const licensePanelUrl = process.env.LICENSE_PANEL_URL
      const internalApiKey = process.env.INTERNAL_API_KEY

      console.log('[api/office365-trial/request] Reserve license env check:', {
        licensePanelUrl,
        hasInternalApiKey: Boolean(internalApiKey),
        internalApiKeyLength: internalApiKey?.length || 0,
        leadId,
        customerEmail: email.trim()
      })

      if (!licensePanelUrl || !internalApiKey) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Configuração do painel de licenças ausente'
        })
      }

      const reserveResponse = await $fetch(`${licensePanelUrl}/api/internal/licenses/reserve-test`, {
        method: 'POST',
        headers: {
          'x-internal-api-key': internalApiKey
        },
        body: {
          leadId,
          customerName: name.trim(),
          customerEmail: email.trim(),
          source: 'landing_page'
        }
      }) as any

      console.log('[api/office365-trial/request] Reserve license response:', JSON.stringify(reserveResponse))

      const responseSuccess =
        reserveResponse === true ||
        reserveResponse?.success === true ||
        reserveResponse?.ok === true

      const licenseStatus =
        reserveResponse?.licenseSend?.status ||
        reserveResponse?.status ||
        null

      const responseLicenseEmail =
        reserveResponse?.licenseSend?.licenseEmail ||
        reserveResponse?.licenseData?.email ||
        reserveResponse?.licenseData?.username ||
        reserveResponse?.license?.email ||
        reserveResponse?.licenseAccount?.email ||
        null

      const responseLicensePassword =
        reserveResponse?.licenseData?.password ||
        reserveResponse?.license?.password ||
        reserveResponse?.licenseAccount?.password ||
        reserveResponse?.licenseSend?.licensePassword ||
        null

      const licenseType =
        reserveResponse?.license?.licenseType ||
        reserveResponse?.licenseData?.licenseType ||
        reserveResponse?.licenseAccount?.licenseType ||
        'Office 365 Teste Grátis'

      const tenantDomain =
        reserveResponse?.license?.tenantDomain ||
        reserveResponse?.licenseData?.tenantDomain ||
        reserveResponse?.licenseAccount?.tenantDomain ||
        null

      if (responseSuccess) {
        licenseReserved = licenseStatus
          ? licenseStatus === 'SENT' || licenseStatus === 'RESERVED' || licenseStatus === 'ACTIVE'
          : true

        licenseEmail = responseLicenseEmail

        // Se a licença foi reservada e temos dados, enviar e-mail
        if (licenseReserved && responseLicenseEmail && responseLicensePassword) {
          licensePassword = responseLicensePassword

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
                    <p><strong>E-mail Microsoft:</strong> ${licenseEmail}</p>
                    <p><strong>Senha provisória:</strong> <code style="background: #e0e0e0; padding: 2px 5px; border-radius: 3px;">${licensePassword}</code></p>
                    <p><strong>Tipo:</strong> ${licenseType}</p>
                    ${tenantDomain ? `<p><strong>Domínio:</strong> ${tenantDomain}</p>` : ''}
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

                  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #856404;">
                      <strong>Aviso:</strong> Este é um teste grátis oferecido pela Casa do Software como condição promocional. Não é um trial oficial da Microsoft.
                    </p>
                  </div>
                  
                  <hr style="margin: 30px 0;">
                  
                  <p>Se tiver dúvidas ou precisar de ajuda, entre em contato conosco:</p>

                  <p>
                    <strong>E-mail:</strong> suporte@casadosoftware.com.br<br>
                    <strong>WhatsApp:</strong> (11) 91051-2647
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
          }
        } else {
          console.error('[api/office365-trial/request] License reserved but missing email/password:', {
            licenseReserved,
            hasLicenseEmail: Boolean(responseLicenseEmail),
            hasLicensePassword: Boolean(responseLicensePassword)
          })
        }
      }
    } catch (reserveError: any) {
      console.error('[api/office365-trial/request] Reserve license error:', reserveError)
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

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao processar solicitação'
    })
  }
})