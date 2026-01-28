import { resolve } from 'path'

export default defineNuxtConfig({
  srcDir: 'app',

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo-casa-do-software.png' },
        { rel: 'apple-touch-icon', href: '/logo-casa-do-software.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      meta: [
        { name: 'theme-color', content: '#2563eb' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      mercadopagoPublicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
      googleAdsConversionId: process.env.GOOGLE_ADS_CONVERSION_ID || '',
      googleAdsConversionLabel: process.env.GOOGLE_ADS_CONVERSION_LABEL || '',
    },
  },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  nitro: {
    publicAssets: [
      {
        baseURL: '/',
        dir: resolve(__dirname, 'app/public'),
      },
    ],
  },

  alias: {
    '#root': resolve(__dirname),
  },

  vite: {
    resolve: {
      alias: {
        '#root': resolve(__dirname),
      },
    },
  },
})
