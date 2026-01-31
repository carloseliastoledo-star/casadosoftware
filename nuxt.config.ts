import { resolve } from 'path'

export default defineNuxtConfig({
  srcDir: 'app',

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: process.env.SITE_LOGO_PATH || '/logo.png' },
        { rel: 'apple-touch-icon', href: process.env.SITE_LOGO_PATH || '/logo.png' },
        { rel: 'manifest', href: '/api/site.webmanifest' }
      ],
      meta: [
        { name: 'theme-color', content: process.env.SITE_THEME_COLOR || '#2563eb' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      storeSlug: process.env.STORE_SLUG || '',
      siteUrl: process.env.SITE_URL || '',
      siteName: process.env.SITE_NAME || 'Site',
      logoPath: process.env.SITE_LOGO_PATH || '/logo.png',
      supportEmail: process.env.SUPPORT_EMAIL || '',
      whatsappNumber: process.env.WHATSAPP_NUMBER || '',
      topbarText: process.env.SITE_TOPBAR_TEXT || '',
      topbarLink: process.env.SITE_TOPBAR_LINK || '',
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
