import type { H3Event } from 'h3'
import { getCookie, getRequestHeader } from 'h3'

export type IntlContext = {
  language: 'pt' | 'en' | 'es' | 'it' | 'fr'
  locale: 'pt-BR' | 'en-US' | 'es-ES' | 'it-IT' | 'fr-FR'
  currency: 'brl' | 'usd' | 'eur'
  host: string
}

function normalizeLanguage(input: unknown): 'pt' | 'en' | 'es' | 'it' | 'fr' | null {
  const v = String(input || '').trim().toLowerCase()
  if (!v) return null
  if (v === 'pt' || v === 'pt-br' || v.startsWith('pt')) return 'pt'
  if (v === 'en' || v === 'en-us' || v.startsWith('en')) return 'en'
  if (v === 'es' || v === 'es-es' || v.startsWith('es')) return 'es'
  if (v === 'it' || v === 'it-it' || v.startsWith('it')) return 'it'
  if (v === 'fr' || v === 'fr-fr' || v.startsWith('fr')) return 'fr'
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

function detectLanguageFromAcceptLanguage(raw: unknown): 'pt' | 'en' | 'es' | 'it' | 'fr' | null {
  const s = String(raw || '').trim().toLowerCase()
  if (!s) return null
  const parts = s
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  for (const p of parts) {
    const base = p.split(';')[0]?.trim() || ''
    const lang = normalizeLanguage(base)
    if (lang) return lang
  }
  return null
}

function detectLanguageFromPath(event?: H3Event): 'pt' | 'en' | 'es' | 'it' | 'fr' | null {
  if (!event) return null
  const raw = String((event as any).path || (event as any).node?.req?.url || '')
  const pathname = raw.split('?')[0] || ''
  if (pathname === '/en' || pathname.startsWith('/en/')) return 'en'
  if (pathname === '/es' || pathname.startsWith('/es/')) return 'es'
  if (pathname === '/it' || pathname.startsWith('/it/')) return 'it'
  if (pathname === '/fr' || pathname.startsWith('/fr/')) return 'fr'
  return null
}

function isEuropeanCountry(countryCode: string): boolean {
  const c = String(countryCode || '').trim().toUpperCase()
  if (!c) return false

  const eu = new Set([
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
    'ES',
    'SE'
  ])

  const eeaExtra = new Set(['NO', 'IS', 'LI', 'CH', 'GB'])
  return eu.has(c) || eeaExtra.has(c)
}

function readCountryCode(event?: H3Event): string {
  if (!event) return ''
  const headersToCheck = [
    'cf-ipcountry',
    'x-vercel-ip-country',
    'x-country',
    'x-geo-country',
    'fastly-client-country'
  ]
  for (const h of headersToCheck) {
    const raw = String(getRequestHeader(event, h) || '').trim()
    if (raw) return raw.toUpperCase()
  }
  return ''
}

function readHost(event?: H3Event): string {
  if (!event) return ''

  const rawForwarded = String(getRequestHeader(event, 'x-forwarded-host') || '').trim()
  const rawHost = String(getRequestHeader(event, 'host') || '').trim()

  const candidates = [rawForwarded, rawHost]
    .filter(Boolean)
    .flatMap((v) => v.split(',').map((p) => p.trim()))
    .filter(Boolean)
    .map((v) => v.toLowerCase())

  if (!candidates.length) return ''

  const publicDomain = 'casadosoftware.com.br'
  const preferred = candidates.find((h) => h.includes(publicDomain))
  return (preferred || candidates[0] || '').toLowerCase()
}

function isSubdomainModeEnabled(): boolean {
  return String(process.env.INTL_SUBDOMAIN_MODE || '').trim() === '1'
}

function detectSubdomainLanguage(host: string): 'pt' | 'en' | 'es' | 'it' | 'fr' | null {
  const h = String(host || '').trim().toLowerCase()
  if (!h) return null
  if (h.startsWith('pt.')) return 'pt'
  if (h.startsWith('en.')) return 'en'
  if (h.startsWith('es.')) return 'es'
  if (h.startsWith('it.')) return 'it'
  if (h.startsWith('fr.')) return 'fr'
  return null
}

function defaultCurrencyForLanguage(lang: 'pt' | 'en' | 'es' | 'it' | 'fr'): 'brl' | 'usd' | 'eur' {
  if (lang === 'pt') return 'brl'
  if (lang === 'en') return 'usd'
  return 'eur'
}

export function getIntlContext(event?: H3Event): IntlContext {
  const host = readHost(event)

  const subdomainMode = isSubdomainModeEnabled()
  const subdomainLanguage = detectSubdomainLanguage(host)

  const cookieLang = normalizeLanguage(getCookie(event as any, 'ld_lang'))
  const cookieCurrency = normalizeCurrency(getCookie(event as any, 'ld_currency'))
  const cookieCountry = String(getCookie(event as any, 'ld_country') || '').trim().toUpperCase()

  const acceptLang = detectLanguageFromAcceptLanguage(getRequestHeader(event as any, 'accept-language'))
  const pathLang = detectLanguageFromPath(event)
  const headerCountry = readCountryCode(event)
  const inferredHostCountry = host.endsWith('.com.br') || host.includes('.com.br:') ? 'BR' : ''
  const country = cookieCountry || headerCountry || (cookieCurrency ? '' : inferredHostCountry)

  let language: 'pt' | 'en' | 'es' | 'it' | 'fr' = 'pt'
  let currency: 'brl' | 'usd' | 'eur' = 'brl'

  if (subdomainLanguage) {
    language = subdomainLanguage
    currency = defaultCurrencyForLanguage(subdomainLanguage)
  } else {
    if (subdomainMode && subdomainLanguage) {
      language = subdomainLanguage
    } else if (pathLang) language = pathLang
    else if (cookieLang) language = cookieLang
    else if (acceptLang) language = acceptLang
    else if (subdomainLanguage) language = subdomainLanguage

    if (cookieCurrency) {
      currency = cookieCurrency
    } else if (subdomainMode && (subdomainLanguage || language)) {
      currency = defaultCurrencyForLanguage((subdomainLanguage || language) as any)
    } else if (country) {
      if (country === 'BR') currency = 'brl'
      else if (isEuropeanCountry(country)) currency = 'eur'
      else currency = 'usd'
    } else {
      currency = defaultCurrencyForLanguage(language)
    }
  }

  const locale =
    language === 'en'
      ? 'en-US'
      : language === 'es'
        ? 'es-ES'
        : language === 'it'
          ? 'it-IT'
          : language === 'fr'
            ? 'fr-FR'
            : 'pt-BR'
  return { language, locale, currency, host }
}
