export function useSite() {
  const config = useRuntimeConfig()
  const siteName = String(config.public.siteName || 'Softwares Mundi')
  const siteUrl = String(config.public.siteUrl || '')

  function absoluteUrl(path: string) {
    const p = path.startsWith('/') ? path : `/${path}`
    const base = String(siteUrl || '').replace(/\/$/, '')
    return base ? `${base}${p}` : ''
  }

  return { siteName, siteUrl, absoluteUrl }
}
