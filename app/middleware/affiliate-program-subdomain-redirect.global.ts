export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return

  const host = String(window.location.host || '').trim().toLowerCase()

  const hostLang = host.startsWith('en.')
    ? 'en'
    : host.startsWith('es.')
      ? 'es'
      : host.startsWith('fr.')
        ? 'fr'
        : host.startsWith('de.')
          ? 'de'
          : host.startsWith('it.')
            ? 'it'
            : host.startsWith('pt.')
              ? 'pt'
              : ''

  if (!hostLang) return

  const path = String(to.path || '')

  const knownAffiliatePaths = new Set([
    '/pt/programa-afiliados',
    '/es/programa-afiliados',
    '/fr/programme-affiliation',
    '/de/partner-program',
    '/en/affiliate-program',
    '/en/become-a-partner'
  ])

  if (!knownAffiliatePaths.has(path)) return

  const target =
    hostLang === 'en'
      ? '/en/affiliate-program'
      : hostLang === 'es'
        ? '/es/programa-afiliados'
        : hostLang === 'fr'
          ? '/fr/programme-affiliation'
          : hostLang === 'de'
            ? '/de/partner-program'
            : '/pt/programa-afiliados'

  if (target === path) return

  return navigateTo(
    {
      path: target,
      query: to.query,
      hash: to.hash
    },
    { replace: true }
  )
})
