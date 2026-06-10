import { resolve } from 'path'

export default defineNuxtConfig({
  srcDir: 'app',

  ssr: true,

  experimental: {
    asyncContext: true,
  },

  sourcemap: {
    client: true,
    server: false,
  },

  app: {
    head: {
      script: [
        {
          key: 'gtm',
          innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TRF7PNLP');`,
          tagPriority: 0
        },
        { src: 'https://sdk.mercadopago.com/js/v2' }
      ],
      noscript: [
        {
          key: 'gtm-noscript',
          innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TRF7PNLP" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          tagPosition: 'bodyOpen'
        }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico?v2' },
        { rel: 'apple-touch-icon', href: '/favicon.ico?v2' },
        { rel: 'manifest', href: '/api/site.webmanifest' },
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
      logoPath: process.env.SITE_LOGO_PATH || 'https://pub-388810139d004c3eb59d2d54c6e92aa7.r2.dev/uploads/Logo%20Marca%201.png',
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
      API_URL: process.env.API_URL || '',
      seoEnableEnDomain: String(process.env.SEO_ENABLE_EN_DOMAIN || '').trim().toLowerCase() === 'true',
      enDomainUrl: process.env.EN_DOMAIN_URL || 'https://casadosoftware.store',
      ptDomainUrl: process.env.PT_DOMAIN_URL || 'https://casadosoftware.com.br',
    },
  },

  components: [
    { path: '~/components', pathPrefix: false }
  ],

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  routeRules: {
    // Redirects 301 para URLs antigas de produtos
    '/produto/microsoft-office-365-vitalicio': {
      redirect: '/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive'
    },
    '/produto/microsoft-office-365-vitalicio-5-licenses-pc-mac-android-ou-ios-1-tb-one-drive': {
      redirect: '/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive'
    },

    // Redirects 301 para idiomas não usados (apenas PT para casadosoftware.com.br)
    '/en': { redirect: '/' },
    '/es': { redirect: '/' },
    '/fr': { redirect: '/' },
    '/it': { redirect: '/' },
    '/en/**': { redirect: '/' },
    '/es/**': { redirect: '/' },
    '/fr/**': { redirect: '/' },
    '/it/**': { redirect: '/' },

    // Bloquear indexação de vps.casadosoftware.com.br
    '/**': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow'
      }
    },

    // APIs de produtos e categorias (não sensíveis)
    '/api/products': {
      headers: {
        'cache-control': 's-maxage=300, stale-while-revalidate=600'
      }
    },
    '/api/products/**': {
      headers: {
        'cache-control': 's-maxage=300, stale-while-revalidate=600'
      }
    },
    '/api/categories': {
      headers: {
        'cache-control': 's-maxage=300, stale-while-revalidate=600'
      }
    },
    '/api/categories/**': {
      headers: {
        'cache-control': 's-maxage=300, stale-while-revalidate=600'
      }
    },
    '/api/checkout-config': {
      headers: {
        'cache-control': 's-maxage=60, stale-while-revalidate=300'
      }
    },
    
    // Páginas estáticas (landing pages)
    '/lp/produtividade': {
      headers: {
        'cache-control': 's-maxage=600, stale-while-revalidate=3600'
      }
    },
    '/lp/office-365-pro': {
      headers: {
        'cache-control': 's-maxage=600, stale-while-revalidate=3600'
      }
    },
    '/lp/**': {
      headers: {
        'cache-control': 's-maxage=300, stale-while-revalidate=1800'
      }
    },
    
    // Páginas de conteúdo estático
    '/quem-somos': {
      headers: {
        'cache-control': 's-maxage=600, stale-while-revalidate=3600'
      }
    },
    '/entrega-digital': {
      headers: {
        'cache-control': 's-maxage=600, stale-while-revalidate=3600'
      }
    },
    '/reembolso': {
      headers: {
        'cache-control': 's-maxage=600, stale-while-revalidate=3600'
      }
    },
    '/privacidade': {
      headers: {
        'cache-control': 's-maxage=600, stale-while-revalidate=3600'
      }
    },
    '/termos': {
      headers: {
        'cache-control': 's-maxage=600, stale-while-revalidate=3600'
      }
    },
    
    // Página de produtos (sem cache para garantir conteúdo atualizado)
    '/produtos': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/products': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/produto/**': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/product/**': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate'
      }
    },

    // Home page (página inicial)
    '/': {
      headers: {
        'cache-control': 's-maxage=60, stale-while-revalidate=300'
      }
    },
    
    // Blog (não sensível)
    '/blog': {
      headers: {
        'cache-control': 's-maxage=300, stale-while-revalidate=1800'
      }
    },
    '/blog/**': {
      headers: {
        'cache-control': 's-maxage=300, stale-while-revalidate=1800'
      }
    },
    
    // Não cachear APIs sensíveis
    '/api/checkout': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/api/create-pix': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/api/mercadopago/**': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/api/affiliate/**': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/api/admin/**': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate'
      }
    },
    '/checkout': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate'
      }
    }
  },

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
    externals: {
      external: ['@prisma/client', '.prisma/client'],
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

      pages.push({
        name: 'blog-index',
        path: '/blog',
        file: blogIndexFile
      })
      pages.push({
        name: 'blog-slug',
        path: '/blog/:slug',
        file: blogSlugFile
      })
    }
  }
})
