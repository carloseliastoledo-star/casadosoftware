import type { H3Event } from 'h3'
import { getRequestHeader } from 'h3'

export type IntlContext = {
  language: 'pt' | 'en' | 'es'
  locale: 'pt-BR' | 'en-US' | 'es-ES'
  currency: 'brl' | 'usd' | 'eur'
  host: string
}

function readHost(event?: H3Event): string {
  if (!event) return ''
  const raw = String(getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host') || '')
  const first = raw.split(',')[0]?.trim() || ''
  return first.toLowerCase()
}

export function getIntlContext(event?: H3Event): IntlContext {
  const host = readHost(event)

  const isEn = host.startsWith('en.')
  const isEs = host.startsWith('es.')

  if (isEn) {
    return { language: 'en', locale: 'en-US', currency: 'usd', host }
  }

  if (isEs) {
    return { language: 'es', locale: 'es-ES', currency: 'eur', host }
  }

  return { language: 'pt', locale: 'pt-BR', currency: 'brl', host }
}
