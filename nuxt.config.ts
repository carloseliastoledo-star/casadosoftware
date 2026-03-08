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
      intlSubdomainMode: String(process.env.INTL_SUBDOMAIN_MODE || '').trim() === '1',
      affiliateEnabled: String(process.env.AFFILIATE_ENABLED || '').trim().toLowerCase() === 'true',
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

  hooks: {
    'pages:extend'(pages) {
      const productFile = resolve(__dirname, 'app/pages/produto/[slug].vue')
      pages.push({
        name: 'product-slug',
        path: '/product/:slug',
        file: productFile
      })
      pages.push({
        name: 'producto-slug',
        path: '/producto/:slug',
        file: productFile
      })

      const blogIndexFile = resolve(__dirname, 'app/pages/blog/index.vue')
      const blogSlugFile = resolve(__dirname, 'app/pages/blog/[slug].vue')
      const blogLangPrefixes = ['pt', 'en', 'es', 'fr', 'it', 'de']

      for (const lang of blogLangPrefixes) {
        pages.push({
          name: `${lang}-blog-index`,
          path: `/${lang}/blog`,
          file: blogIndexFile
        })
        pages.push({
          name: `${lang}-blog-slug`,
          path: `/${lang}/blog/:slug`,
          file: blogSlugFile
        })
      }

      const affiliateLoginFile = resolve(__dirname, 'app/pages/affiliate/login.vue')
      const affiliateActivateFile = resolve(__dirname, 'app/pages/affiliate/ativar.vue')
      const affiliateSubscribeFile = resolve(__dirname, 'app/pages/affiliate/inscrever.vue')
      const affiliateDashboardFile = resolve(__dirname, 'app/pages/affiliate/dashboard.vue')

      for (const lang of blogLangPrefixes) {
        pages.push({
          name: `${lang}-affiliate-login`,
          path: `/${lang}/affiliate/login`,
          file: affiliateLoginFile
        })
        pages.push({
          name: `${lang}-affiliate-ativar`,
          path: `/${lang}/affiliate/ativar`,
          file: affiliateActivateFile
        })
        pages.push({
          name: `${lang}-affiliate-inscrever`,
          path: `/${lang}/affiliate/inscrever`,
          file: affiliateSubscribeFile
        })
        pages.push({
          name: `${lang}-affiliate-dashboard`,
          path: `/${lang}/affiliate/dashboard`,
          file: affiliateDashboardFile
        })
      }
    }
  }
})
