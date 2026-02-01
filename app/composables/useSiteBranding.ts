export function useSiteBranding() {
  const config = useRuntimeConfig()

  const storeSlug = String((config.public as any)?.storeSlug || '').trim()

  const host = computed(() => {
    if (process.server) {
      const headers = useRequestHeaders(['x-forwarded-host', 'host']) as Record<string, string | undefined>
      const raw = headers?.['x-forwarded-host'] || headers?.host || ''
      const first = String(raw).split(',')[0]?.trim()
      return String(first || '').toLowerCase()
    }

    return String(window.location.host || '').toLowerCase()
  })

  const isCasaDoSoftware = computed(() => {
    if (storeSlug === 'casadosoftware') return true
    return host.value.includes('casadosoftware.com.br')
  })

  const defaultSiteName = computed(() => (isCasaDoSoftware.value ? 'Casa do Software' : 'Licenças Digitais'))
  const defaultLogoPath = computed(() => (isCasaDoSoftware.value ? '/logo-casa-do-software.png' : '/logo-licencasdigitais.png'))

  const siteName = String(config.public.siteName || '').trim() || defaultSiteName.value

  const rawLogo = String(config.public.logoPath || '').trim()
  const logoPath = rawLogo && rawLogo !== '/logo.png' ? rawLogo : defaultLogoPath.value
  const supportEmail = String(config.public.supportEmail || '').trim() || ''
  const topbarText = String(config.public.topbarText || '').trim() || ''
  const topbarLink = String(config.public.topbarLink || '').trim() || ''
  const whatsappNumber = String(config.public.whatsappNumber || '').trim() || ''

  return {
    siteName,
    logoPath,
    supportEmail,
    topbarText,
    topbarLink,
    whatsappNumber
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
