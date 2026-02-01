type ClientIntl = {
  language: 'pt' | 'en' | 'es'
  locale: 'pt-BR' | 'en-US' | 'es-ES'
  currency: 'BRL' | 'USD' | 'EUR'
  currencyLower: 'brl' | 'usd' | 'eur'
  isIntl: boolean
  host: string
}

function detectHost(): string {
  if (process.server) {
    const headers = useRequestHeaders(['x-forwarded-host', 'host']) as Record<string, string | undefined>
    const raw = headers?.['x-forwarded-host'] || headers?.host || ''
    const first = String(raw).split(',')[0]?.trim()
    return String(first || '').toLowerCase()
  }

  return String(window.location.host || '').toLowerCase()
}

export function useIntlContext() {
  const host = computed(() => detectHost())

  const language = computed<ClientIntl['language']>(() => {
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
    isIntl
  }
}
