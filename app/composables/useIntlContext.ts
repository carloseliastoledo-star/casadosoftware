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

function detectHost(): string {
  if (import.meta.server) {
    try {
      const headers = useRequestHeaders(['x-forwarded-host', 'host']) as Record<string, string | undefined>
      const raw = headers?.['x-forwarded-host'] || headers?.host || ''
      const first = String(raw).split(',')[0]?.trim()
      return String(first || '').toLowerCase()
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

export function useIntlContext() {
  const config = useRuntimeConfig()
  const subdomainMode = computed(() => Boolean((config.public as any)?.intlSubdomainMode))
  const host = computed(() => detectHost())

  const langCookie = useCookie<string | null>('ld_lang', { sameSite: 'lax', path: '/' })
  const currencyCookie = useCookie<string | null>('ld_currency', { sameSite: 'lax', path: '/' })
  const countryCookie = useCookie<string | null>('ld_country', { sameSite: 'lax', path: '/' })

  const countryCode = computed(() => String(countryCookie.value || '').trim().toUpperCase())

  const language = computed<ClientIntl['language']>(() => {
    if (subdomainMode.value) {
      const sub = detectSubdomainLanguage(host.value)
      if (sub) return sub
    }
    const cookie = String(langCookie.value || '').trim()
    if (cookie) return normalizeLanguage(cookie)
    return 'pt'
  })

  const locale = computed<ClientIntl['locale']>(() => languageToLocale(language.value))

  const currencyLower = computed<ClientIntl['currencyLower']>(() => {
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
      langCookie.value = normalizeLanguage(next)
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
