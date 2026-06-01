import { defineEventHandler, createError, readBody, getHeader } from 'h3'
import prisma from '../../../db/prisma'

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY

export default defineEventHandler(async (event) => {
  // Verificar chave de API interna
  const apiKey = getHeader(event, 'x-internal-api-key')
  if (!apiKey || apiKey !== INTERNAL_API_KEY) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const body = await readBody(event)
  const { customerName, customerEmail, source } = body

  if (!customerEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: 'customerEmail is required'
    })
  }

  try {
    // Buscar licença disponível do tipo Office 365
    // Priorizar licenças de estoque (customerId: null)
    const availableLicense = await prisma.$queryRawUnsafe(`
      SELECT * FROM LicenseAccount
      WHERE customerId IS NULL
      AND status = 'active'        AND activationStatus IN ('not_activated', 'activated')
      AND licenseType IN ('business_basic', 'business_standard', 'business_premium')
      ORDER BY createdAt ASC
      LIMIT 1
    `) as any[]

    if (!availableLicense || availableLicense.length === 0) {
      return {
        success: false,
        error: 'NO_LICENSE_AVAILABLE',
        message: 'No license available in stock'
      }
    }

    const license = availableLicense[0]

    // Marcar licença como ativada/enviada
    const updatedLicense = await prisma.licenseAccount.update({
      where: { id: license.id },
      data: {
        activationStatus: 'activated',
        deliveredAt: new Date(),
        notes: `Reserved for test: ${customerName || 'N/A'} (${customerEmail}) - Source: ${source || 'unknown'}`
      }
    })

    // Criar log de histórico
    const logData: any = {
      licenseAccountId: license.id,
      performedBy: 'internal_api',
      action: 'reserve_test',
      metadata: JSON.stringify({
        customerName,
        customerEmail,
        source
      })
    }

    // Só incluir customerId se existir
    if (updatedLicense.customerId) {
      logData.customerId = updatedLicense.customerId
    }

    await prisma.licenseLog.create({
      data: logData
    })

    // Retornar dados da licença
    // NOTA: Atualmente passwordEncrypted é armazenado em texto plano
    // Futuramente implementar criptografia reversível com chave no .env
    return {
      success: true,
      license: {
        id: updatedLicense.id,
        email: updatedLicense.email,
        password: updatedLicense.passwordEncrypted, // Senha legível para envio ao cliente
        licenseType: updatedLicense.licenseType,
        tenantDomain: updatedLicense.tenantDomain,
        deliveredAt: updatedLicense.deliveredAt
      }
    }
  } catch (error: any) {
    console.error('[internal/licenses/reserve-test] error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})