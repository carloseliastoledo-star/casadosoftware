type ClientIntl = {
  language: 'pt' | 'en' | 'es' | 'fr' | 'it'
  locale: 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'it-IT'
  currency: 'BRL' | 'USD' | 'EUR'
  currencyLower: 'brl' | 'usd' | 'eur'
  isIntl: boolean
  host: string
  countryCode: string
  setLanguage: (next: ClientIntl['language']) => void
  setCurrency: (next: 'brl' | 'usd' | 'eur') => void
  setCountry: (next: string) => void
}

function normalizeLanguage(input: unknown): ClientIntl['language'] {
  const v = String(input || '').trim().toLowerCase()
  if (v === 'en' || v === 'es' || v === 'fr' || v === 'it') return v
  return 'pt'
}

function languageToLocale(lang: ClientIntl['language']): ClientIntl['locale'] {
  if (lang === 'en') return 'en-US'
  if (lang === 'es') return 'es-ES'
  if (lang === 'fr') return 'fr-FR'
  if (lang === 'it') return 'it-IT'
  return 'pt-BR'
}

function normalizeCurrency(input: unknown): 'brl' | 'usd' | 'eur' | null {
  const v = String(input || '').trim().toLowerCase()
  if (!v) return null
  if (v === 'brl') return 'brl'
  if (v === 'usd') return 'usd'
  if (v === 'eur') return 'eur'
  return null
}

function detectLanguageFromNavigator(): ClientIntl['language'] | null {
  if (typeof window === 'undefined') return null
  const list = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language]
  for (const raw of list) {
    const v = String(raw || '').trim().toLowerCase()
    if (!v) continue
    if (v === 'en' || v.startsWith('en')) return 'en'
    if (v === 'es' || v.startsWith('es')) return 'es'
    if (v === 'fr' || v.startsWith('fr')) return 'fr'
    if (v === 'it' || v.startsWith('it')) return 'it'
    if (v === 'pt' || v.startsWith('pt')) return 'pt'
  }
  return null
}

function detectHost(): string {
  if (import.meta.server) {
    try {
      const event = useRequestEvent()
      const rawForwarded = String(event?.node?.req?.headers?.['x-forwarded-host'] || '').trim()
      const rawHost = String(event?.node?.req?.headers?.host || '').trim()

      const candidates = [rawForwarded, rawHost]
        .filter(Boolean)
        .flatMap((v) => String(v).split(',').map((p) => p.trim()))
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())

      if (!candidates.length) return ''

      return String(candidates[0] || '').toLowerCase()
    } catch {
      return ''
    }
  }

  return String(window.location.host || '').toLowerCase()
}

function detectSubdomainLanguage(host: string): ClientIntl['language'] | null {
  const h = String(host || '').trim().toLowerCase()
  if (!h) return null
  if (h.startsWith('pt.')) return 'pt'
  if (h.startsWith('en.')) return 'en'
  if (h.startsWith('es.')) return 'es'
  if (h.startsWith('fr.')) return 'fr'
  if (h.startsWith('it.')) return 'it'
  return null
}

function defaultCurrencyForLanguage(lang: ClientIntl['language']): 'brl' | 'usd' | 'eur' {
  if (lang === 'pt') return 'brl'
  if (lang === 'en') return 'usd'
  return 'eur'
}

function detectLanguageFromPath(): ClientIntl['language'] | null {
  try {
    const path = import.meta.server
      ? String(useRequestURL()?.pathname || '')
      : String(window.location?.pathname || '')
    if (path === '/en' || path.startsWith('/en/')) return 'en'
    if (path === '/es' || path.startsWith('/es/')) return 'es'
    if (path === '/fr' || path.startsWith('/fr/')) return 'fr'
    if (path === '/it' || path.startsWith('/it/')) return 'it'
    return null
  } catch {
    return null
  }
}

export function useIntlContext() {
  const config = useRuntimeConfig()
  const subdomainMode = computed(() => Boolean((config.public as any)?.intlSubdomainMode))
  const host = computed(() => detectHost())

  const langCookie = useCookie<string | null>('ld_lang', { sameSite: 'lax', path: '/' })
  const currencyCookie = useCookie<string | null>('ld_currency', { sameSite: 'lax', path: '/' })
  const countryCookie = useCookie<string | null>('ld_country', { sameSite: 'lax', path: '/' })

  const countryCode = computed(() => String(countryCookie.value || '').trim().toUpperCase())

  const isEnDomain = computed(() => {
    const h = host.value
    return (
      h.length > 0 &&
      !h.endsWith('.com.br') &&
      !h.includes('.com.br:') &&
      !h.includes('localhost') &&
      !h.includes('127.0.0.1') &&
      !h.includes('.vercel.app')
    )
  })

  const language = computed<ClientIntl['language']>(() => {
    const sub = detectSubdomainLanguage(host.value)
    if (subdomainMode.value && sub) return sub

    const fromPath = detectLanguageFromPath()
    if (fromPath) return fromPath

    if (sub) return sub

    if (isEnDomain.value) return 'en'

    const cookie = String(langCookie.value || '').trim()
    if (cookie) return normalizeLanguage(cookie)

    if (!import.meta.server) {
      const n = detectLanguageFromNavigator()
      if (n) return n
    }

    return 'pt'
  })

  const locale = computed<ClientIntl['locale']>(() => languageToLocale(language.value))

  const currencyLower = computed<ClientIntl['currencyLower']>(() => {
    const sub = detectSubdomainLanguage(host.value)
    if (sub) {
      return defaultCurrencyForLanguage(sub)
    }

    if (isEnDomain.value) return 'usd'

    const fromCookie = normalizeCurrency(currencyCookie.value)
    if (fromCookie) return fromCookie

    if (subdomainMode.value) {
      return defaultCurrencyForLanguage(language.value)
    }

    const country = String(countryCode.value || '').trim().toUpperCase()

    if (country === 'BR') return 'brl'

    const eur = new Set([
      'AT',
      'BE',
      'BG',
      'HR',
      'CY',
      'CZ',
      'DK',
      'EE',
      'FI',
      'FR',
      'DE',
      'GR',
      'HU',
      'IE',
      'IT',
      'LV',
      'LT',
      'LU',
      'MT',
      'NL',
      'PL',
      'PT',
      'RO',
      'SK',
      'SI',
      'ES'
    ])

    if (country) {
      if (eur.has(country)) return 'eur'
      return 'usd'
    }

    if (isEnDomain.value) return 'usd'

    return 'brl'
  })

  const currency = computed<ClientIntl['currency']>(() => {
    if (currencyLower.value === 'usd') return 'USD'
    if (currencyLower.value === 'eur') return 'EUR'
    return 'BRL'
  })

  const isIntl = computed(() => currencyLower.value !== 'brl')

  return {
    host,
    language,
    locale,
    currency,
    currencyLower,
    isIntl,
    countryCode,
    setLanguage: (next: ClientIntl['language']) => {
      langCookie.value = next
    },
    setCurrency: (next: 'brl' | 'usd' | 'eur') => {
      currencyCookie.value = next
    },
    setCountry: (next: string) => {
      const v = String(next || '').trim().toUpperCase()
      countryCookie.value = v || null
    }
  }
}
