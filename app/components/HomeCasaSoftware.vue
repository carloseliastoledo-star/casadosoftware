<template>
  <section>
    <!-- 1. Hero -->
    <HomeHeroNew :products-index-path="productsIndexPath" />

    <!-- 2. Por que escolher -->
    <HomeBenefitsNew />

    <!-- 3. Melhores produtos -->
    <HomeCategoriesNew :products-index-path="productsIndexPath">
      <div v-if="pending" class="text-center py-16 text-gray-500">
        {{ $t('home.loading_products') }}
      </div>
      <div v-else-if="hasError" class="text-center py-16 text-red-600">
        {{ $t('home.error_loading_products') }}
      </div>
      <div v-else-if="products.length === 0" class="text-center py-16 text-gray-400">
        {{ $t('home.no_best_sellers') }}
      </div>
      <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ProductCard
          v-for="product in products.slice(0, 8)"
          :key="product.id"
          :product="product"
        />
      </div>
    </HomeCategoriesNew>

    <!-- 4. Como funciona -->
    <HomeStepsNew :products-index-path="productsIndexPath" />

    <!-- 5. CTA afiliados -->
    <HomeCtaNew :cta="affiliateCta" />
  </section>
</template>

<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'

const intl = useIntlContext()

const productsIndexPath = computed(() =>
  intl.language.value === 'en' ? '/products' : '/produtos'
)

const affiliateLandingTo = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return '/en/become-a-partner'
  if (lang === 'es') return '/es/programa-afiliados'
  if (lang === 'fr') return '/fr/programme-affiliation'
  if (lang === 'de') return '/de/partner-program'
  return '/pt/programa-afiliados'
})

const affiliateCtaKicker = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'Earn with us'
  if (lang === 'es') return 'Gana con nosotros'
  if (lang === 'fr') return 'Gagnez avec nous'
  if (lang === 'de') return 'Verdienen Sie mit uns'
  return 'Ganhe com a gente'
})

const affiliateCtaHighlight = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'Up to 30%'
  if (lang === 'es') return 'Hasta 30%'
  if (lang === 'fr') return "Jusqu'à 30%"
  if (lang === 'de') return 'Bis zu 30%'
  return 'Até 30%'
})

const affiliateCtaNoFees = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'No fees.'
  if (lang === 'es') return 'Sin costos.'
  if (lang === 'fr') return 'Sans frais.'
  if (lang === 'de') return 'Keine Gebühren.'
  return 'Sem taxas.'
})

const affiliateCtaStartToday = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'Start promoting today.'
  if (lang === 'es') return 'Empieza a promocionar hoy.'
  if (lang === 'fr') return "Commencez à promouvoir aujourd'hui."
  if (lang === 'de') return 'Starten Sie noch heute.'
  return 'Comece hoje mesmo.'
})

const affiliateCtaWorldwide = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'Worldwide'
  if (lang === 'es') return 'Global'
  if (lang === 'fr') return 'Mondial'
  if (lang === 'de') return 'Weltweit'
  return 'Global'
})

const affiliateCtaStatCommissionLabel = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'Commission'
  if (lang === 'es') return 'Comisión'
  if (lang === 'fr') return 'Commission'
  if (lang === 'de') return 'Provision'
  return 'Comissão'
})

const affiliateCtaStatProductsLabel = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'Products'
  if (lang === 'es') return 'Productos'
  if (lang === 'fr') return 'Produits'
  if (lang === 'de') return 'Produkte'
  return 'Produtos'
})

const affiliateCtaStatProductsValue = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'Windows & Office'
  if (lang === 'es') return 'Windows y Office'
  if (lang === 'fr') return 'Windows et Office'
  if (lang === 'de') return 'Windows & Office'
  return 'Windows e Office'
})

const affiliateCtaTitle = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'Join our Partner Program'
  if (lang === 'es') return 'Únete a nuestro programa'
  if (lang === 'fr') return 'Rejoignez notre programme'
  if (lang === 'de') return 'Werden Sie Partner'
  return 'Participe do nosso programa'
})

const affiliateCtaSubtitle = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'Earn up to 30% commission promoting digital software.'
  if (lang === 'es') return 'Gana hasta un 30% de comisión promoviendo software digital.'
  if (lang === 'fr') return "Gagnez jusqu’à 30% de commission en recommandant des logiciels numériques."
  if (lang === 'de') return 'Verdienen Sie bis zu 30% Provision mit digitaler Software.'
  return 'Ganhe até 30% de comissão promovendo software digital.'
})

const affiliateCtaButton = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'Become a Partner'
  if (lang === 'es') return 'Conviértete en socio'
  if (lang === 'fr') return 'Devenir partenaire'
  if (lang === 'de') return 'Partner werden'
  return 'Seja um parceiro'
})

const affiliateCtaAudienceTitle = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'Great for:'
  if (lang === 'es') return 'Ideal para:'
  if (lang === 'fr') return 'Idéal pour :'
  if (lang === 'de') return 'Ideal für:'
  return 'Ideal para:'
})

const affiliateCtaAudience1 = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'YouTubers'
  if (lang === 'es') return 'YouTubers'
  if (lang === 'fr') return 'YouTubeurs'
  if (lang === 'de') return 'YouTuber'
  return 'YouTubers'
})

const affiliateCtaAudience2 = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'Bloggers'
  if (lang === 'es') return 'Blogueros'
  if (lang === 'fr') return 'Blogueurs'
  if (lang === 'de') return 'Blogger'
  return 'Blogueiros'
})

const affiliateCtaAudience3 = computed(() => {
  const lang = String(intl.language.value || 'pt')
  if (lang === 'en') return 'International affiliates'
  if (lang === 'es') return 'Afiliados internacionales'
  if (lang === 'fr') return 'Affiliés internationaux'
  if (lang === 'de') return 'Internationale Affiliates'
  return 'Afiliados internacionais'
})

const forwardedHeaders = import.meta.server
  ? useRequestHeaders(['x-forwarded-host', 'x-original-host', 'host'])
  : undefined

function normalizeHostValue(input: unknown) {
  const raw = String(input || '').trim().toLowerCase()
  if (!raw) return ''
  const noProto = raw.replace(/^https?:\/\//, '')
  const noPath = noProto.replace(/\/.*/, '')
  const noPort = noPath.replace(/:\d+$/, '')
  return noPort.replace(/^www\./, '')
}

function pickPublicHost(input: unknown) {
  const raw = String(input || '').trim()
  if (!raw) return ''
  const parts = raw
    .split(',')
    .map((p) => normalizeHostValue(p))
    .filter(Boolean)

  if (parts.length === 0) return ''
  const preferred = parts.find((h) =>
    h.includes('casadosoftware.com.br') || h.includes('licencasdigitais.com.br')
  )
  return preferred || parts[0] || ''
}

const forwardedHost = import.meta.server
  ? pickPublicHost(
      (forwardedHeaders as any)?.['x-forwarded-host'] ||
      (forwardedHeaders as any)?.['x-original-host'] ||
      (forwardedHeaders as any)?.host ||
      ''
    )
  : ''

const fetchHeaders = import.meta.server
  ? ({ 'x-forwarded-host': forwardedHost } as Record<string, string>)
  : undefined

const clientHost = !import.meta.server
  ? pickPublicHost(typeof window !== 'undefined' ? window.location.host : '')
  : ''

const keyHost = import.meta.server ? forwardedHost : clientHost
const asyncKey = `best-sellers:${keyHost || 'default'}`

const { data, pending } = await useAsyncData(
  asyncKey,
  async () => {
    try {
      const result = await $fetch('/api/products/best-sellers', {
        headers: fetchHeaders as any,
        timeout: 5000
      })
      return Array.isArray(result) ? result : []
    } catch (err: any) {
      console.error('[home][products] failed:', err?.message || err)
      // Return empty array to prevent SSR breaking
      return []
    }
  },
  {
    server: true,
    default: () => [],
    transform: (data: any) => Array.isArray(data) ? data : []
  }
)

const products = computed(() =>
  Array.isArray(data.value) ? data.value : []
)

const hasError = computed(() => false)

const affiliateCta = computed(() => ({
  to: affiliateLandingTo.value,
  kicker: affiliateCtaKicker.value,
  highlight: affiliateCtaHighlight.value,
  title: affiliateCtaTitle.value,
  subtitle: affiliateCtaSubtitle.value,
  button: affiliateCtaButton.value,
  noFees: affiliateCtaNoFees.value,
  startToday: affiliateCtaStartToday.value,
  worldwide: affiliateCtaWorldwide.value,
  audienceTitle: affiliateCtaAudienceTitle.value,
  audiences: [affiliateCtaAudience1.value, affiliateCtaAudience2.value, affiliateCtaAudience3.value],
  statCommissionLabel: affiliateCtaStatCommissionLabel.value,
  statProductsLabel: affiliateCtaStatProductsLabel.value,
  statProductsValue: affiliateCtaStatProductsValue.value,
}))
</script>