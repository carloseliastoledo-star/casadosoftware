import { resolve } from 'path'

export default defineNuxtConfig({
  srcDir: 'app',

  ssr: true,

  sourcemap: {
    client: true,
    server: false,
  },

  app: {
    head: {
      link: [
        { rel: 'icon', href: process.env.SITE_LOGO_PATH || '/logo-mercadosoftwares.png' },
        { rel: 'apple-touch-icon', href: process.env.SITE_LOGO_PATH || '/logo-mercadosoftwares.png' },
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
      companyLegalName: process.env.COMPANY_LEGAL_NAME || '',
      companyCnpj: process.env.COMPANY_CNPJ || '',
      companyAddress: process.env.COMPANY_ADDRESS || '',
      companyPhone: process.env.COMPANY_PHONE || '',
      companyEmail: process.env.COMPANY_EMAIL || '',
      topbarText: process.env.SITE_TOPBAR_TEXT || '',
      topbarLink: process.env.SITE_TOPBAR_LINK || '',
      mercadopagoPublicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
      gaId: process.env.GA_ID || '',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
      googleAdsConversionId: process.env.GOOGLE_ADS_CONVERSION_ID || '',
      googleAdsConversionLabel: process.env.GOOGLE_ADS_CONVERSION_LABEL || '',
    },
  },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  nitro: {
    routeRules: {
      '/': { ssr: false },
    },
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
