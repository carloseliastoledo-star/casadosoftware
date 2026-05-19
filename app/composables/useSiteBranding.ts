export function useSiteBranding() {
  const config = useRuntimeConfig()

  const defaultSiteName = 'Mercado Softwares'
  const defaultLogoPath = '/logo-mercadosoftwares.png'

  const rawName = String((config.public as any)?.siteName || '').trim()
  const siteName = rawName && rawName !== 'Site' ? rawName : defaultSiteName

  const rawLogo = String(config.public.logoPath || '').trim()
  const logoPath = rawLogo && rawLogo !== '/logo.png' ? rawLogo : defaultLogoPath
  const supportEmail = String(config.public.supportEmail || '').trim() || ''
  const topbarText = String(config.public.topbarText || '').trim() || ''
  const topbarLink = String(config.public.topbarLink || '').trim() || ''
  const whatsappNumber = String(config.public.whatsappNumber || '').trim() || ''

  const companyLegalName = String((config.public as any).companyLegalName || '').trim() || 'Softwares Mundi LTDA'
  const companyCnpj = String((config.public as any).companyCnpj || '').trim() || '66.464.267/0001-48'
  const companyAddress = String((config.public as any).companyAddress || '').trim() ||
    'AV ENG LUIZ CARLOS BERRINI, 1748 - Cidade Monções, São Paulo - SP'
  const companyPhone = String((config.public as any).companyPhone || '').trim() || '+55 11 91069-1485'
  const companyEmail = String((config.public as any).companyEmail || '').trim() || 'sac@mercadosoftwares.com.br'
  const googleReviewsUrl = String((config.public as any).googleReviewsUrl || '').trim() || 'https://maps.app.goo.gl/LqHsKbBC4Y7FjqDo7'
  const googleReviewRequestUrl = String((config.public as any).googleReviewRequestUrl || '').trim() || 'https://g.page/r/CQzqUpnMFYiKEAE/review'

  return {
    siteName,
    logoPath,
    supportEmail,
    topbarText,
    topbarLink,
    whatsappNumber,
    companyLegalName,
    companyCnpj,
    companyAddress,
    companyPhone,
    companyEmail,
    googleReviewsUrl,
    googleReviewRequestUrl
  }
}

export function useSiteUrl() {
  const config = useRuntimeConfig()
  const configured = String(config.public.siteUrl || '').trim()

  if (import.meta.server) {
    try {
      const url = useRequestURL()
      const origin = String(url?.origin || '').trim()
      if (origin) return origin.replace(/\/$/, '')
    } catch {
      // ignore
    }
  }

  if (configured) return configured.replace(/\/$/, '')

  if (typeof window !== 'undefined' && window.location?.origin) {
    return String(window.location.origin).replace(/\/$/, '')
  }

  return ''
}
