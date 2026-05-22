<template>
  <section>
    <!-- 1. Hero -->
    <HomeHeroNew :products-index-path="productsIndexPath" :home-theme="homeTheme" />

    <!-- 2. Por que escolher -->
    <HomeBenefitsNew />

    <!-- 3. Escolha por categoria -->
    <HomeCategoryCards v-if="categorias.length > 0" :categories="categorias" />

    <!-- 4. Melhores produtos -->
    <HomeCategoriesNew :products-index-path="productsIndexPath">
      <div v-if="pending" class="text-center py-16 text-gray-500">
        {{ $t('home.loading_products') }}
      </div>
      <div v-else-if="hasError || products.length === 0" class="py-8">
        <div class="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">
          <h3 class="text-xl font-black text-gray-900">Oferta principal disponível</h3>
          <p class="mt-2 text-sm text-gray-600">Compra segura com entrega digital imediata, mesmo em instabilidade momentânea.</p>
          <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
            <NuxtLink to="/carrinho" class="inline-flex rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 transition">
              Comprar agora
            </NuxtLink>
            <a href="https://wa.me/5511910512647" target="_blank" rel="noopener" class="inline-flex rounded-xl border border-green-600 px-5 py-3 text-sm font-bold text-green-700 hover:bg-green-100 transition">
              WhatsApp
            </a>
          </div>
        </div>
        <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <article
            v-for="product in safeProducts.slice(0, 8)"
            :key="String(product?.id || product?.slug || 'fallback-product')"
            class="rounded-2xl border border-gray-200 bg-white p-4"
          >
            <img
              :src="String(product?.image || '/images/fallback-product.png')"
              :alt="String(product?.name || 'Produto')"
              loading="lazy"
              width="400"
              height="300"
              class="h-40 w-full rounded-lg object-cover"
              @error="handleFallbackImageError"
            />
            <h4 class="mt-3 text-base font-bold text-gray-900">{{ product?.name || 'Produto' }}</h4>
            <p class="mt-1 text-sm text-gray-600">R$ {{ Number(product?.price || 0).toFixed(2) }}</p>
            <NuxtLink :to="String(product?.checkoutUrl || '/checkout')" class="mt-3 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
              Comprar agora
            </NuxtLink>
          </article>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ProductCard
          v-for="product in safeProducts.slice(0, 8)"
          :key="product.id"
          :product="product"
        />
      </div>
    </HomeCategoriesNew>

    <!-- 4. Como funciona -->
    <HomeStepsNew :products-index-path="productsIndexPath" />

    <!-- 5. Avaliações de clientes -->
    <ReviewsSection :limit="6" />

    <!-- 6. CTA afiliados -->
    <HomeCtaNew :cta="affiliateCta" />
  </section>
</template>

<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'
import { fallbackProducts } from '~/data/fallbackProducts'
import type { HomeTheme } from '~/types/homeTheme'

const props = defineProps<{ homeTheme?: HomeTheme | null }>()
const homeTheme = computed(() => props.homeTheme ?? null)

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

const { data, pending, error } = await useFetch('/api/products/best-sellers', {
  server: false,
  lazy: true,
  default: () => [],
  timeout: 5000,
  transform: (raw: any) => Array.isArray(raw) ? raw : []
})

const { data: categoriasData } = await useFetch('/api/categorias', {
  server: true,
  default: () => null
})

const products = computed(() =>
  Array.isArray(data.value) ? data.value : []
)

// Categorias permitidas para Casa do Software (usar apenas slugs principais)
const allowedCategories = [
  'windows',           // Remove 'licenças-windows' se existir
  'windows-server',
  'office',            // Remove 'microsoft-office' se existir
  'autodesk',
  'corel',
  'antivirus'
]

const categorias = computed(() => {
  const allCategorias = categoriasData.value?.categorias || []
  const filtered = allCategorias.filter(cat => allowedCategories.includes(cat.slug))
  // Remover duplicatas baseadas no slug
  const unique = filtered.filter((cat, index, self) =>
    index === self.findIndex(c => c.slug === cat.slug)
  )
  // Ordenar por ordem da lista de permitidos
  const ordered = unique.sort((a, b) => {
    const indexA = allowedCategories.indexOf(a.slug)
    const indexB = allowedCategories.indexOf(b.slug)
    return indexA - indexB
  })
  return ordered
})

const hasError = computed(() => Boolean(error.value))

const safeProducts = computed(() => {
  if (products.value.length > 0) return products.value
  return fallbackProducts.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    image: item.image,
    checkoutUrl: item.checkoutUrl
  }))
})

function handleFallbackImageError(event: Event) {
  const target = event.target as HTMLImageElement | null
  if (!target) return
  target.src = 'https://pub-388810139d004c3eb59d2d54c6e92aa7.r2.dev/uploads/Logo%20Marca%201.png'
}

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