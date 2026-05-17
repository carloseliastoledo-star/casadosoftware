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
  if (h.endsWith('.store') || h.includes('casadosoftware.store')) return 'en'
  if (h.includes('gvgmall.co')) return 'en'
  if (h.includes('globalsoftware-prev') && h.includes('vercel.app')) return 'en'
  return null
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const host = detectHost()
  const subdomainLang = detectSubdomainLanguage(host)

  const langCookie = useCookie<string | null>('ld_lang', { sameSite: 'lax', path: '/' })

  const cookieLang = langCookie.value ? normalizeLang(langCookie.value) : null
  // On intl domains (gvgmall.co etc), subdomain detection ALWAYS wins over the cookie.
  // This prevents a ld_lang=pt cookie set on casadosoftware.com.br from forcing PT on gvgmall.co.
  const initialLang = subdomainLang || cookieLang || 'pt'

  // Expose detected language to useIntlContext() via Nuxt state.
  // This is the most reliable SSR language source: the plugin runs synchronously
  // before any component setup, with full access to the request headers.
  const langState = useState<Lang>('ld_server_lang', () => initialLang)
  if (import.meta.server) langState.value = initialLang

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
        const cookieVal = next ? normalizeLang(next) : null
        i18n.global.locale.value = cookieVal || subdomainLang || 'en'
      }
    )
  }
})
