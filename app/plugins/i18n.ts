import { createI18n } from 'vue-i18n'

import pt from '../../i18n/locales/pt.json'
import en from '../../i18n/locales/en.json'
import es from '../../i18n/locales/es.json'
import fr from '../../i18n/locales/fr.json'
import it from '../../i18n/locales/it.json'

type Lang = 'pt' | 'en' | 'es' | 'fr' | 'it'

function normalizeLang(input: unknown): Lang {
  const v = String(input || '').trim().toLowerCase()
  if (v === 'en' || v === 'es' || v === 'fr' || v === 'it') return v
  return 'pt'
}

function detectHost(): string {
  if (import.meta.server) {
    try {
      const event = useRequestEvent()
      const raw = String(event?.node?.req?.headers?.['x-forwarded-host'] || event?.node?.req?.headers?.host || '')
      const first = raw.split(',')[0]?.trim() || ''
      return String(first || '').toLowerCase()
    } catch {
      return ''
    }
  }
  return String(window.location.host || '').toLowerCase()
}

function detectSubdomainLanguage(host: string): Lang | null {
  const h = String(host || '').trim().toLowerCase()
  if (!h) return null
  if (h.startsWith('pt.')) return 'pt'
  if (h.startsWith('en.')) return 'en'
  if (h.startsWith('es.')) return 'es'
  if (h.startsWith('fr.')) return 'fr'
  if (h.startsWith('it.')) return 'it'
  return null
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const subdomainMode = Boolean((config.public as any)?.intlSubdomainMode)
  const host = detectHost()
  const subdomainLang = subdomainMode ? detectSubdomainLanguage(host) : null

  const langCookie = useCookie<string | null>('ld_lang', { sameSite: 'lax', path: '/' })

  const initialLang = subdomainLang || normalizeLang(langCookie.value)

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: initialLang,
    fallbackLocale: 'pt',
    messages: {
      pt,
      en,
      es,
      fr,
      it
    }
  })

  nuxtApp.vueApp.use(i18n)

  if (import.meta.client) {
    watch(
      () => langCookie.value,
      (next) => {
        if (subdomainMode && subdomainLang) {
          i18n.global.locale.value = subdomainLang
          return
        }
        i18n.global.locale.value = normalizeLang(next)
      }
    )
  }
})
