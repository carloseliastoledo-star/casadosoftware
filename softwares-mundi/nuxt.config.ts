import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2026-03-18',
  srcDir: 'app/',
  ssr: true,
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  vite: {
    server: {
      hmr: {
        port: 24679
      }
    }
  },
  runtimeConfig: {
    stripeSecretKey: '',
    public: {
      siteName: 'Softwares Mundi',
      siteUrl: '',
      stripeSuccessUrl: '',
      stripeCancelUrl: ''
    }
  },
  app: {
    head: {
      titleTemplate: '%s | Softwares Mundi',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#1D4ED8' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  }
})
