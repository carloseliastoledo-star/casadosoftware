import en from './app/locales/en.json'
import pt from './app/locales/pt.json'
import es from './app/locales/es.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    pt,
    es
  }
}))
