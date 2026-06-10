export function useSiteBranding() {
  const config = useRuntimeConfig()
  const siteSettings = useState('siteSettings', () => null as any)

  const defaultSiteName = 'Mercado Softwares'
  const defaultLogoPath = '/logo-mercadosoftwares.png'

  const rawName = String(siteSettings.value?.siteName || (config.public as any)?.siteName || '').trim()
  const siteName = rawName && rawName !== 'Site' ? rawName : defaultSiteName

  const rawLogo = String(config.public.logoPath || '').trim()
  
  // Detectar se é Casa do Software e usar logo do Cloudflare R2 como default
  const isCasaDoSoftware = siteName === 'Casa do Software' || siteName === 'Casa do Software'
  const casaSoftwareLogo = 'https://pub-388810139d004c3eb59d2d54c6e92aa7.r2.dev/uploads/Logo%20Marca%201.png'
  
  const logoPath = rawLogo && rawLogo !== '/logo.png' ? rawLogo : (isCasaDoSoftware ? casaSoftwareLogo : defaultLogoPath)
  const supportEmail = String(siteSettings.value?.supportEmail || config.public.supportEmail || '').trim() || 'comercial@casadosoftware.com.br'
  const topbarText = String(siteSettings.value?.topbarText || config.public.topbarText || '').trim() || ''
  const topbarLink = String(siteSettings.value?.topbarLink || config.public.topbarLink || '').trim() || ''
  const whatsappNumber = String(siteSettings.value?.whatsappNumber || config.public.whatsappNumber || '').trim() || ''

  const companyLegalName = String(siteSettings.value?.companyLegalName || (config.public as any).companyLegalName || '').trim() || 'Softwares Mundi LTDA'
  const companyCnpj = String(siteSettings.value?.companyCnpj || (config.public as any).companyCnpj || '').trim() || '66.464.267/0001-48'
  const companyAddress = String(siteSettings.value?.companyAddress || (config.public as any).companyAddress || '').trim() ||
    'AV ENG LUIZ CARLOS BERRINI, 1748 - Cidade Monções, São Paulo - SP'
  const companyPhone = String(siteSettings.value?.companyPhone || (config.public as any).companyPhone || '').trim() || '+55 11 910512647'
  const companyEmail = String(siteSettings.value?.companyEmail || (config.public as any).companyEmail || '').trim() || 'comercial@casadosoftware.com.br'
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
