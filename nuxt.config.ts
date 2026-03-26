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
        { rel: 'manifest', href: '/api/site.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' }
      ],
      meta: [
        { name: 'theme-color', content: process.env.SITE_THEME_COLOR || '#2563eb' },
        { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' }
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
      pagarmePublicKey: process.env.PAGARME_PUBLIC_KEY || '',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      metaPixelId: process.env.META_PIXEL_ID || '',
      gaId: process.env.GA_ID || '',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
      googleAdsConversionId: process.env.GOOGLE_ADS_CONVERSION_ID || '',
      googleAdsConversionLabel: process.env.GOOGLE_ADS_CONVERSION_LABEL || '',
      API_URL: process.env.API_URL || ''
    },
  },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  nitro: {
    preset: 'node-server',
    publicAssets: [
      {
        baseURL: '/',
        dir: resolve(__dirname, 'app/public'),
      },
    ],
    alias: {
      '#root': resolve(__dirname),
    },
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

      const productsIndexFile = resolve(__dirname, 'app/pages/produtos/index.vue')
      pages.push({
        name: 'products-index',
        path: '/products',
        file: productsIndexFile
      })

      const categoryFile = resolve(__dirname, 'app/pages/categoria/[slug].vue')
      pages.push({
        name: 'category-slug',
        path: '/category/:slug',
        file: categoryFile
      })

      const categoriesIndexFile = resolve(__dirname, 'app/pages/categorias.vue')
      pages.push({
        name: 'categories-index',
        path: '/categories',
        file: categoriesIndexFile
      })

      // ── Language-prefixed home pages ───────────────────────────────────────
      const homeFile = resolve(__dirname, 'app/pages/index.vue')
      for (const lang of ['en', 'es', 'fr', 'it']) {
        pages.push({ name: `${lang}-home`, path: `/${lang}`, file: homeFile })
      }

      // ── Language-prefixed product pages ────────────────────────────────────
      const langProductPaths: Array<{ lang: string; prefix: string; listSuffix: string }> = [
        { lang: 'en', prefix: 'product',  listSuffix: 'products'  },
        { lang: 'es', prefix: 'producto', listSuffix: 'productos' },
        { lang: 'fr', prefix: 'produit',  listSuffix: 'produits'  },
        { lang: 'it', prefix: 'prodotto', listSuffix: 'prodotti'  }
      ]
      for (const { lang, prefix, listSuffix } of langProductPaths) {
        pages.push({
          name: `${lang}-${prefix}-slug`,
          path: `/${lang}/${prefix}/:slug`,
          file: productFile
        })
        pages.push({
          name: `${lang}-${listSuffix}-index`,
          path: `/${lang}/${listSuffix}`,
          file: productsIndexFile
        })
      }

      // ── Language-prefixed category pages ───────────────────────────────────
      const langCategoryPaths: Array<{ lang: string; prefix: string; listSuffix: string }> = [
        { lang: 'en', prefix: 'category',  listSuffix: 'categories' },
        { lang: 'es', prefix: 'categoria', listSuffix: 'categorias' },
        { lang: 'fr', prefix: 'categorie', listSuffix: 'categories' },
        { lang: 'it', prefix: 'categoria', listSuffix: 'categorie'  }
      ]
      for (const { lang, prefix, listSuffix } of langCategoryPaths) {
        pages.push({
          name: `${lang}-${prefix}-slug`,
          path: `/${lang}/${prefix}/:slug`,
          file: categoryFile
        })
        pages.push({
          name: `${lang}-${listSuffix}-list`,
          path: `/${lang}/${listSuffix}`,
          file: categoriesIndexFile
        })
      }

      const aboutUsFile = resolve(__dirname, 'app/pages/quem-somos.vue')
      pages.push({
        name: 'about-us',
        path: '/about-us',
        file: aboutUsFile
      })

      const digitalDeliveryFile = resolve(__dirname, 'app/pages/entrega-digital.vue')
      pages.push({
        name: 'digital-delivery',
        path: '/digital-delivery',
        file: digitalDeliveryFile
      })

      const refundPolicyFile = resolve(__dirname, 'app/pages/reembolso.vue')
      pages.push({
        name: 'refund-policy',
        path: '/refund-policy',
        file: refundPolicyFile
      })

      const privacyPolicyFile = resolve(__dirname, 'app/pages/privacidade.vue')
      pages.push({
        name: 'privacy-policy',
        path: '/privacy-policy',
        file: privacyPolicyFile
      })

      const termsOfUseFile = resolve(__dirname, 'app/pages/termos.vue')
      pages.push({
        name: 'terms-of-use',
        path: '/terms-of-use',
        file: termsOfUseFile
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
