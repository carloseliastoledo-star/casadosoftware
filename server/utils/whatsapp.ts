export function normalizeBrazilPhone(phone: string) {
  let cleaned = String(phone || '').replace(/\D/g, '')

  while (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1)
  }

  if (cleaned && !cleaned.startsWith('55')) {
    cleaned = `55${cleaned}`
  }

  return cleaned
}

export async function sendWhatsAppText(phone: string, message: string) {
  const instanceId = process.env.ZAPI_INSTANCE_ID
  const token = process.env.ZAPI_TOKEN
  const clientToken = process.env.ZAPI_CLIENT_TOKEN
  const baseUrl = process.env.ZAPI_BASE_URL || 'https://api.z-api.io'

  const normalizedPhone = normalizeBrazilPhone(phone)

  if (!normalizedPhone) {
    return { success: false, error: 'phone_required' }
  }

  if (!message) {
  message = `Você esqueceu sua ativação 😱

Seu Office está pronto para liberar agora:

👉 https://casadosoftware.com.br/checkout

Entrega imediata após pagamento ⚡`
}

  if (!instanceId || !token) {
    return { success: false, error: 'zapi_not_configured' }
  }

  try {
    const response = await fetch(`${baseUrl}/instances/${instanceId}/token/${token}/send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(clientToken ? { 'Client-Token': clientToken } : {})
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        message
      })
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return { success: false, error: data || response.statusText }
    }

    return { success: true, data }

  } catch (error) {
    console.error('[WHATSAPP ERROR]', error)
    return { success: false, error }
  }
}

