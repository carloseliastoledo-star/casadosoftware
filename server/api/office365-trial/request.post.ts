import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '../db/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

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
    
    // Criar lead no banco
    const leadId = crypto.randomUUID()
    await prisma.$executeRawUnsafe(`
      INSERT INTO Office365TrialLead (
        id, name, email, whatsapp, usageType, systemType,
        status, trialStartAt, trialExpiresAt, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      trialStartAt
    )

    // Chamar endpoint interno para reservar licença
    let licenseReserved = false
    let licenseEmail = null
    let licensePassword = null

    try {
      const reserveResponse = await $fetch('/api/internal/office365-reserve-license', {
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
          // Aqui você pode adicionar lógica para enviar e-mail
          // Por enquanto, apenas log
          console.log('[api/office365-trial/request] License reserved:', reserveResponse.licenseData)
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
        : 'Solicitação recebida. Entraremos em contato em breve.',
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
