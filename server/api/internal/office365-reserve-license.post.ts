import { defineEventHandler, createError, readBody } from 'h3'
import { prisma } from '../../db/prisma'

const LICENSE_PANEL_URL = process.env.LICENSE_PANEL_URL
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { leadId, customerName, customerEmail, source } = body

  if (!leadId || !customerEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: 'leadId and customerEmail are required'
    })
  }

  try {
    // Chamar API do license-panel para reservar licença
    let licenseData = null
    let status = 'SENT'
    let licensePanelId = null
    let licenseEmail = null

    if (LICENSE_PANEL_URL && INTERNAL_API_KEY) {
      try {
        const response = await $fetch(`${LICENSE_PANEL_URL}/api/internal/licenses/reserve-test`, {
          method: 'POST',
          headers: {
            'x-internal-api-key': INTERNAL_API_KEY,
            'Content-Type': 'application/json'
          },
          body: {
            customerName,
            customerEmail,
            source: source || 'landing_page'
          }
        })

        if (response.success) {
          licenseData = response.license
          licensePanelId = licenseData.id
          licenseEmail = licenseData.email
        } else {
          // Sem licença disponível
          status = 'PENDING_STOCK'
        }
      } catch (error: any) {
        console.error('[internal/office365-reserve-license] license-panel error:', error)
        status = 'ERROR'
      }
    } else {
      // License-panel não configurado
      status = 'PENDING_STOCK'
    }

    // Criar registro de envio
    const licenseSend = await prisma.office365TestLicenseSend.create({
      data: {
        leadId,
        customerName,
        customerEmail,
        licensePanelId,
        licenseEmail,
        sentAt: new Date(),
        paymentStatus: 'PENDING',
        status,
        source: source || 'landing_page'
      }
    })

    return {
      success: true,
      licenseSend,
      licenseData
    }
  } catch (error: any) {
    console.error('[internal/office365-reserve-license] error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
