type ClientIntl = {
  language: 'pt' | 'en' | 'es'
  locale: 'pt-BR' | 'en-US' | 'es-ES'
  currency: 'BRL' | 'USD' | 'EUR'
  currencyLower: 'brl' | 'usd' | 'eur'
  isIntl: boolean
  host: string
  countryCode: string
  setLanguage: (next: 'pt' | 'en' | 'es') => void
  setCurrency: (next: 'brl' | 'usd' | 'eur') => void
  setCountry: (next: string) => void
}

function normalizeLanguage(input: unknown): 'pt' | 'en' | 'es' | null {
  const v = String(input || '').trim().toLowerCase()
  if (!v) return null
  if (v === 'pt' || v === 'pt-br' || v.startsWith('pt')) return 'pt'
  if (v === 'en' || v === 'en-us' || v.startsWith('en')) return 'en'
  if (v === 'es' || v === 'es-es' || v.startsWith('es')) return 'es'
  return null
}

function normalizeCurrency(input: unknown): 'brl' | 'usd' | 'eur' | null {
  const v = String(input || '').trim().toLowerCase()
  if (!v) return null
  if (v === 'brl') return 'brl'
  if (v === 'usd') return 'usd'
  if (v === 'eur') return 'eur'
  return null
}

function detectLanguageFromNavigator(): 'pt' | 'en' | 'es' | null {
  if (typeof window === 'undefined') return null
  const list = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language]
  for (const raw of list) {
    const lang = normalizeLanguage(raw)
    if (lang) return lang
  }
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

export function useIntlContext() {
  const host = computed(() => detectHost())

  const langCookie = useCookie<string | null>('ld_lang', { sameSite: 'lax', path: '/' })
  const currencyCookie = useCookie<string | null>('ld_currency', { sameSite: 'lax', path: '/' })
  const countryCookie = useCookie<string | null>('ld_country', { sameSite: 'lax', path: '/' })

  const countryCode = computed(() => String(countryCookie.value || '').trim().toUpperCase())

  const language = computed<ClientIntl['language']>(() => {
    const c = normalizeLanguage(langCookie.value)
    if (c) return c

    if (!import.meta.server) {
      const n = detectLanguageFromNavigator()
      if (n) return n
    }

    if (host.value.startsWith('en.')) return 'en'
    if (host.value.startsWith('es.')) return 'es'
    return 'pt'
  })

  const locale = computed<ClientIntl['locale']>(() => {
    if (language.value === 'en') return 'en-US'
    if (language.value === 'es') return 'es-ES'
    return 'pt-BR'
  })

  const currencyLower = computed<ClientIntl['currencyLower']>(() => {
    const c = normalizeCurrency(currencyCookie.value)
    if (c) return c
    if (language.value === 'en') return 'usd'
    if (language.value === 'es') return 'eur'
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
    setLanguage: (next) => {
      langCookie.value = next
    },
    setCurrency: (next) => {
      currencyCookie.value = next
    },
    setCountry: (next) => {
      const v = String(next || '').trim().toUpperCase()
      countryCookie.value = v || null
    }
  }
}
