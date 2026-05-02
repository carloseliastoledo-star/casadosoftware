export interface UpsellOffer {
  slug: string
  title: string
  price: string
  url: string
}

const upsellMap: Record<string, UpsellOffer> = {
  'office-365': {
    slug: 'windows-11-pro',
    title: 'Windows 11 Pro',
    price: 'R$ 29,90',
    url: 'https://casadosoftware.com.br/checkout?product=windows-11-pro'
  },
  'microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive': {
    slug: 'windows-11-pro',
    title: 'Windows 11 Pro',
    price: 'R$ 29,90',
    url: 'https://casadosoftware.com.br/checkout?product=windows-11-pro'
  },
  'windows-11-pro': {
    slug: 'office-365',
    title: 'Office 365',
    price: 'R$ 49,90',
    url: 'https://casadosoftware.com.br/checkout?product=office-365'
  },
  'microsoft-windows-11-pro-chave-esd-32-64-bits': {
    slug: 'office-365',
    title: 'Office 365',
    price: 'R$ 49,90',
    url: 'https://casadosoftware.com.br/checkout?product=office-365'
  },
  'office-2021-pro-plus-windows-11-pro': {
    slug: 'suporte-premium',
    title: 'Suporte Premium',
    price: 'R$ 19,90',
    url: 'https://casadosoftware.com.br/checkout?product=suporte-premium'
  }
}

export function getUpsellOffer(productSlug: string): UpsellOffer | null {
  return upsellMap[productSlug] ?? null
}

export function buildUpsellMessage(offer: UpsellOffer): string {
  return `� Já que você ativou, tenho um upgrade especial:\n\n👉 ${offer.url}\n\nHoje consigo liberar com desconto.\n\nQuer que eu te envie?`
}

export async function sendUpsellWhatsApp(phone: string, productSlug: string): Promise<boolean> {
  const offer = getUpsellOffer(productSlug)
  if (!offer) return false

  const { sendWhatsAppText } = await import('./whatsapp')
  const message = buildUpsellMessage(offer)
  const result = await sendWhatsAppText(phone, message)

  if (result.success) {
    console.log('[UPSELL_WHATSAPP_SENT]', { phone, productSlug, upsell: offer.slug })
  } else {
    console.error('[UPSELL_WHATSAPP_ERROR]', { phone, productSlug, error: result.error })
  }

  return result.success
}
