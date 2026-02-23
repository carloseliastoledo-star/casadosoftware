import type { H3Event } from 'h3'
import { getCookie, getRequestHeader } from 'h3'

export type IntlContext = {
  language: 'pt' | 'en' | 'es'
  locale: 'pt-BR' | 'en-US' | 'es-ES'
  currency: 'brl' | 'usd' | 'eur'
  host: string
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

function detectLanguageFromAcceptLanguage(raw: unknown): 'pt' | 'en' | 'es' | null {
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
  const raw = String(getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host') || '')
  const first = raw.split(',')[0]?.trim() || ''
  return first.toLowerCase()
}

export function getIntlContext(event?: H3Event): IntlContext {
  const host = readHost(event)

  const cookieLang = normalizeLanguage(getCookie(event as any, 'ld_lang'))
  const cookieCurrency = normalizeCurrency(getCookie(event as any, 'ld_currency'))
  const cookieCountry = String(getCookie(event as any, 'ld_country') || '').trim().toUpperCase()

  const acceptLang = detectLanguageFromAcceptLanguage(getRequestHeader(event as any, 'accept-language'))
  const country = cookieCountry || readCountryCode(event)

  let language: 'pt' | 'en' | 'es' = 'pt'
  let currency: 'brl' | 'usd' | 'eur' = 'brl'

  const isEn = host.startsWith('en.')
  const isEs = host.startsWith('es.')

  if (cookieLang) language = cookieLang
  else if (acceptLang) language = acceptLang
  else if (isEn) language = 'en'
  else if (isEs) language = 'es'

  if (cookieCurrency) currency = cookieCurrency
  else if (country === 'BR') currency = 'brl'
  else if (country && isEuropeanCountry(country)) currency = 'eur'
  else if (country) currency = 'usd'
  else currency = language === 'pt' ? 'brl' : language === 'es' ? 'eur' : 'usd'

  const locale = language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'pt-BR'
  return { language, locale, currency, host }
}
