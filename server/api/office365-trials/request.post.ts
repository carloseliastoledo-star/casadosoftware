const reserveResponse = await $fetch<{
  success: boolean
  licenseSend?: {
    id: string
    status: string
    licenseAccount?: {
      email: string
      password: string
    }
  }
  message?: string
}>(`${licensePanelUrl}/api/internal/licenses/reserve-test`, {
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
})

if (reserveResponse.success && reserveResponse.licenseSend) {
  licenseReserved = reserveResponse.licenseSend.status === 'SENT'