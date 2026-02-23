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

  const companyLegalName = String((config.public as any).companyLegalName || '').trim() || 'MERCADO SOFTWARES LTDA'
  const companyCnpj = String((config.public as any).companyCnpj || '').trim() || '60.292.316/0001-26'
  const companyAddress = String((config.public as any).companyAddress || '').trim() ||
    'Rua Almerinda Barão Passoni Vila Aparecida Itupeva - SP CEP 13298808'
  const companyPhone = String((config.public as any).companyPhone || '').trim() || '+55 11 91069-1485'
  const companyEmail = String((config.public as any).companyEmail || '').trim() || 'sac@mercadosoftwares.com.br'

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
    companyEmail
  }
}

export function useSiteUrl() {
  const config = useRuntimeConfig()
  const configured = String(config.public.siteUrl || '').trim()

  if (configured) return configured.replace(/\/$/, '')

  if (import.meta.server) {
    try {
      const url = useRequestURL()
      return String(url?.origin || '').replace(/\/$/, '')
    } catch {
      return ''
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return String(window.location.origin).replace(/\/$/, '')
  }

  return ''
}
