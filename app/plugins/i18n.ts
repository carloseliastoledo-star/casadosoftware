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

export default defineNuxtPlugin((nuxtApp) => {
  const langCookie = useCookie<string | null>('ld_lang', { sameSite: 'lax', path: '/' })

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: normalizeLang(langCookie.value),
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
        i18n.global.locale.value = normalizeLang(next)
      }
    )
  }
})
