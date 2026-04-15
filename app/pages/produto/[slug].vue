<template>
  <section class="bg-[#010d1a] min-h-screen text-white">
    <div class="max-w-6xl mx-auto px-4 py-10">

      <!-- Loading -->
      <div v-if="pending" class="flex items-center justify-center py-32 text-cyan-400">
        <svg class="animate-spin w-7 h-7 mr-3" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        {{ t.loading }}
      </div>

      <!-- Produto -->
      <div v-else-if="safeProduct.nome">

        <!-- ── HERO ── -->
        <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          <!-- Imagem -->
          <div class="relative rounded-2xl overflow-hidden bg-[#021326] border border-cyan-500/20 flex items-center justify-center p-6 min-h-[320px] lg:min-h-[480px]">
            <img
              :src="safeImage"
              :alt="safeProduct.nome"
              fetchpriority="high"
              loading="eager"
              decoding="async"
              class="w-full max-h-[440px] object-contain brightness-110 contrast-110 saturate-110"
              referrerpolicy="no-referrer"
              @error="onImageError"
            />
            <div v-if="discountPercent" class="absolute top-3 right-3">
              <span class="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-sm font-black text-white tracking-wider">
                {{ discountPercent }}% OFF
              </span>
            </div>
          </div>

          <!-- Coluna compra -->
          <div class="flex flex-col gap-5">

            <!-- Urgência topo -->
            <div class="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/40 rounded-full px-4 py-1.5 text-sm font-bold text-orange-400 w-fit">
              🔥 Oferta por tempo limitado
            </div>

            <!-- Título -->
            <h1 class="text-2xl md:text-3xl font-extrabold text-white leading-tight">
              {{ pageH1 }}
            </h1>

            <!-- Desc curta -->
            <p v-if="safeProduct.descricaoCurta" class="text-sm text-slate-400 leading-relaxed">
              {{ safeProduct.descricaoCurta }}
            </p>

            <!-- Preço -->
            <div class="flex flex-col gap-1">
              <div v-if="formattedOldPrice" class="flex items-center gap-3">
                <span class="text-slate-500 line-through text-lg">{{ formattedOldPrice }}</span>
                <span v-if="discountPercent" class="text-xs font-black text-red-400 bg-red-400/10 rounded-full px-2 py-0.5">-{{ discountPercent }}%</span>
              </div>
              <div class="text-5xl font-black text-[#00e676] drop-shadow-[0_0_20px_rgba(0,230,118,0.5)] leading-none">
                {{ formattedPrice }}
              </div>
              <div v-if="installments12" class="text-sm text-slate-400 mt-1">
                {{ t.installmentsPrefix }} {{ installments12 }} sem juros
              </div>
              <div v-if="isBrl && formattedPixPrice" class="text-sm font-semibold text-cyan-400 mt-0.5">
                💰 PIX à vista: <span class="text-white">{{ formattedPixPrice }}</span>
              </div>
            </div>

            <!-- CTA principal -->
            <button
              type="button"
              class="w-full bg-[#00e676] hover:bg-[#00ff87] active:scale-[0.98] text-[#010d1a] text-lg font-black uppercase tracking-widest py-4 rounded-xl transition-all duration-200 shadow-[0_0_30px_rgba(0,230,118,0.35)]"
              @click="buyNow"
            >
              🛒 COMPRAR AGORA
            </button>

            <!-- Microcopy -->
            <div class="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400">
              <span class="flex items-center gap-1"><span class="text-[#00e676]">✔</span> Entrega imediata</span>
              <span class="flex items-center gap-1"><span class="text-[#00e676]">✔</span> Ativação em minutos</span>
              <span class="flex items-center gap-1"><span class="text-[#00e676]">✔</span> Compra segura</span>
            </div>

            <!-- Benefícios -->
            <div class="grid grid-cols-2 gap-3">
              <div class="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-300 font-medium">
                <span class="text-[#00e676]">✔</span> Licença original
              </div>
              <div class="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-300 font-medium">
                <span class="text-[#00e676]">✔</span> Entrega automática
              </div>
              <div class="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-300 font-medium">
                <span class="text-[#00e676]">✔</span> Suporte incluso
              </div>
              <div class="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-300 font-medium">
                <span class="text-[#00e676]">✔</span> Garantia de 7 dias
              </div>
            </div>

            <!-- Trust badges -->
            <div class="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
              <div class="flex flex-col items-center text-center gap-1">
                <span class="text-2xl">🔒</span>
                <span class="text-[10px] font-semibold text-slate-400">Compra segura</span>
              </div>
              <div class="flex flex-col items-center text-center gap-1">
                <span class="text-2xl">⭐</span>
                <span class="text-[10px] font-semibold text-slate-400">Produto verificado</span>
              </div>
              <div class="flex flex-col items-center text-center gap-1">
                <span class="text-2xl">💬</span>
                <span class="text-[10px] font-semibold text-slate-400">+1000 clientes</span>
              </div>
              <div class="flex flex-col items-center text-center gap-1">
                <span class="text-2xl">⚡</span>
                <span class="text-[10px] font-semibold text-slate-400">Envio imediato</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── BANNER URGÊNCIA ── -->
        <div class="mt-10 flex items-center justify-center gap-3 bg-red-600/10 border border-red-500/30 rounded-2xl px-6 py-4">
          <span class="text-xl">⚡</span>
          <span class="text-sm font-bold text-red-400">Estoque digital limitado — garanta o seu agora antes que acabe!</span>
        </div>

        <!-- ── O QUE ESTÁ INCLUÍDO ── -->
        <div class="mt-10 bg-[#021326] border border-cyan-500/20 rounded-2xl p-6 md:p-8">
          <div class="text-lg font-bold text-white mb-5">{{ t.included }}</div>
          <ul class="grid sm:grid-cols-2 gap-3">
            <li v-for="item in includedItems" :key="item" class="flex items-start gap-3">
              <span class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00e676]/20">
                <svg viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5 text-[#00e676]">
                  <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.415l-7.25 7.25a1 1 0 01-1.415 0L3.296 9.21a1 1 0 011.415-1.415l3.018 3.018 6.543-6.543a1 1 0 011.432.02z" clip-rule="evenodd" />
                </svg>
              </span>
              <span class="text-sm text-slate-300">{{ item }}</span>
            </li>
          </ul>
        </div>

        <!-- Microsoft 365 info -->
        <div v-if="isMicrosoft365" class="mt-6 bg-[#021326] border border-cyan-500/20 rounded-2xl p-6 text-sm text-slate-300">
          <div class="font-bold text-white mb-3">{{ t.ms365HowTitle }}</div>
          <ul class="list-disc pl-5 space-y-1">
            <li>{{ t.ms365Bullet2 }}</li>
            <li>{{ t.ms365Bullet3 }}</li>
          </ul>
          <div class="mt-3 text-slate-400">
            {{ t.ms365HelpPrefix }} <NuxtLink class="text-cyan-400 hover:underline" :to="digitalDeliveryPath">{{ t.ms365HelpLink }}</NuxtLink>.
          </div>
        </div>

        <!-- ── CTA REPETIDO ── -->
        <div class="mt-10 flex flex-col items-center text-center gap-4">
          <p class="text-sm text-slate-500">🔥 Não perca esta oferta — preço pode mudar a qualquer momento</p>
          <button
            type="button"
            class="inline-flex items-center gap-3 bg-[#00e676] hover:bg-[#00ff87] active:scale-[0.98] text-[#010d1a] text-lg font-black uppercase tracking-widest px-12 py-4 rounded-xl transition-all duration-200 shadow-[0_0_30px_rgba(0,230,118,0.35)]"
            @click="buyNow"
          >
            🛒 COMPRAR AGORA
          </button>
          <div class="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
            <span>🔒 Pagamento seguro</span>
            <span>📧 Entrega por e-mail</span>
            <span>↩️ 7 dias de garantia</span>
          </div>
        </div>

        <!-- ── TUTORIAL ── -->
        <div
          v-if="safeProduct.tutorialTitulo"
          class="mt-10 bg-[#021326] border border-blue-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div class="flex items-center gap-5">
            <div class="bg-blue-600 text-white p-4 rounded-xl text-xl shrink-0">📘</div>
            <div>
              <h3 class="text-lg font-bold text-white">{{ t.tutorialCardTitle }}</h3>
              <p class="text-slate-400 text-sm mt-1">{{ safeProduct.tutorialSubtitulo }}</p>
            </div>
          </div>
          <NuxtLink
            :to="`/tutoriais/${safeProduct.slug}`"
            class="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            → {{ t.viewTutorial }}
          </NuxtLink>
        </div>

        <!-- ── DESCRIÇÃO DETALHADA ── -->
        <div class="bg-[#021326] border border-cyan-500/10 rounded-2xl mt-8 p-6 md:p-8">
          <h2 class="text-xl font-bold text-white mb-4">{{ t.detailedDescription }}</h2>
          <div class="prose prose-invert prose-sm max-w-none text-slate-200" v-html="safeDescriptionHtml" />
        </div>

        <!-- ── POR QUE O PREÇO É BOM ── -->
        <div class="bg-[#021326] border border-cyan-500/10 rounded-2xl mt-6 p-6 md:p-8">
          <h2 class="text-xl font-bold text-white mb-3">{{ t.whyPriceTitle }}</h2>
          <p class="text-slate-400 leading-relaxed text-sm">{{ t.whyPriceP1 }}</p>
          <p class="text-slate-400 leading-relaxed text-sm mt-3">{{ t.whyPriceP2 }}</p>
        </div>

        <!-- SEO content -->
        <div v-if="safeSeoContentHtml" class="mt-8 seo-content-dark">
          <section class="prose prose-invert prose-sm max-w-none text-slate-200" v-html="safeSeoContentHtml" />
        </div>

        <!-- Language switcher -->
        <IntlLanguageSwitcher
          page-type="product"
          :slug="String((safeProduct as any)?.slug || slug || '')"
          class="mt-8 w-full"
        />

        <!-- Afiliados -->
        <div
          v-if="affiliateEnabled"
          class="mt-8 bg-[#021326] border border-cyan-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <div class="text-xl font-extrabold text-white">Ganhe dinheiro indicando este produto.</div>
            <div class="mt-1 text-slate-400 text-sm">Torne-se afiliado.</div>
          </div>
          <NuxtLink
            to="/partner-apply"
            class="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Quero me inscrever
          </NuxtLink>
        </div>

      </div>

      <!-- Produto não encontrado -->
      <div v-else class="text-center py-32 text-slate-500">{{ t.notFound }}</div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { useIntlContext } from '#imports'
import { trackViewItem } from '~/services/analytics'

function safeSanitize(html: string, options?: { ALLOWED_TAGS?: string[]; ALLOWED_ATTR?: string[]; USE_PROFILES?: any }): string {
  const str = String(html || '')
  if (options?.ALLOWED_TAGS?.length === 0) {
    return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  return str
}

definePageMeta({ ssr: true })

const intl = useIntlContext()

const { siteName } = useSiteBranding()

const config = useRuntimeConfig()
const storeSlug = computed(() => String((config.public as any)?.storeSlug || '').trim())

const affiliateEnabled = computed(() => Boolean((config.public as any)?.affiliateEnabled))

const host = computed(() => {
  if (process.server) {
    try {
      const url = useRequestURL()
      if (url?.host) return String(url.host).toLowerCase()
    } catch {
      // ignore
    }

    try {
      const headers = useRequestHeaders(['x-forwarded-host', 'x-original-host', 'host']) as Record<string, string | undefined>
      const raw = headers?.['x-forwarded-host'] || headers?.['x-original-host'] || headers?.host || ''
      const first = String(raw).split(',')[0]?.trim()
      return String(first || '').toLowerCase()
    } catch {
      return ''
    }
  }

  return String(window.location.host || '').toLowerCase()
})

const normalizedHost = computed(() => {
  const h0 = String(host.value || '').trim().toLowerCase()
  const h1 = h0.replace(/^https?:\/\//, '')
  const h2 = h1.replace(/\/.*/, '')
  const h3 = h2.replace(/:\d+$/, '')
  const h4 = h3.replace(/^www\./, '')
  return h4.replace(/\.$/, '')
})

const productsIndexPath = computed(() => (intl.language.value === 'en' ? '/products' : '/produtos'))
const categoryPathPrefix = computed(() => (intl.language.value === 'en' ? '/category' : '/categoria'))
const digitalDeliveryPath = computed(() => (intl.language.value === 'en' ? '/digital-delivery' : '/entrega-digital'))

const isCasaDoSoftware = computed(() => {
  if (normalizedHost.value.includes('casadosoftware.com.br')) return true
  return storeSlug.value === 'casadosoftware'
})

const isLicencasDigitais = computed(() => {
  if (normalizedHost.value.includes('licencasdigitais.com.br')) return true
  return storeSlug.value === 'licencasdigitais'
})

const sectionClass = computed(() => {
  return isLicencasDigitais.value ? 'bg-white min-h-screen' : 'bg-gray-50 min-h-screen py-10'
})

const containerClass = computed(() => {
  return isLicencasDigitais.value ? 'max-w-7xl mx-auto px-6 pt-8 pb-12' : 'max-w-6xl mx-auto px-6'
})

const breadcrumbClass = computed(() => {
  return isLicencasDigitais.value ? 'text-xs text-gray-500 mb-5' : 'text-sm text-gray-500 mb-6'
})

const titleClass = computed(() => {
  return isLicencasDigitais.value
    ? 'text-2xl md:text-3xl font-extrabold text-gray-900 mb-6'
    : 'text-3xl md:text-4xl font-extrabold text-gray-900 mb-8'
})

const mainCardClass = computed(() => {
  return isLicencasDigitais.value
    ? 'bg-white border rounded-2xl p-6 md:p-8 grid lg:grid-cols-2 gap-10'
    : 'bg-white rounded-2xl border border-gray-100 shadow-sm p-8 grid lg:grid-cols-2 gap-10'
})

const imageWrapClass = computed(() => {
  return isLicencasDigitais.value ? 'flex items-center justify-center bg-gray-50 border rounded-2xl p-6' : 'flex items-center justify-center bg-gray-50 rounded-2xl p-6'
})

const buyColumnClass = computed(() => {
  return isLicencasDigitais.value ? 'space-y-6 lg:pl-2' : 'space-y-6'
})

const buyButtonClass = computed(() => {
  return isLicencasDigitais.value
    ? 'w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-bold py-3.5 rounded-md transition'
    : 'w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-lg font-bold py-4 rounded-xl transition shadow-md shadow-blue-200/60'
})

const tutorialCardClass = computed(() => {
  return isLicencasDigitais.value
    ? 'mt-10 border border-blue-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-blue-50'
    : 'mt-12 border border-blue-500 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-blue-50'
})

const descriptionCardClass = computed(() => {
  return isLicencasDigitais.value ? 'bg-white border rounded-2xl mt-10 p-6 md:p-8 space-y-10' : 'bg-white rounded-2xl border border-gray-100 shadow-sm mt-10 p-8 space-y-10'
})

const whyPriceCardClass = computed(() => {
  return isLicencasDigitais.value ? 'bg-white border rounded-2xl mt-8 p-6 md:p-8' : 'bg-white rounded-2xl border border-gray-100 shadow-sm mt-8 p-8'
})

const route = useRoute()
const slug = route.params.slug as string

const { hreflangLinks: productHreflang } = useSeoLocale({
  pageType: 'product',
  slug: computed(() => String((safeProduct.value as any)?.slug || slug || ''))
})

const lang = computed(() => intl.language.value)

const isClient = import.meta.client

const requestFetch = useRequestFetch()

const isOffice365FiveLicenses = computed(() => {
  const s = String(slug || '').trim().toLowerCase()
  return s === 'microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive'
})

const pageH1 = computed(() => {
  if (isCasaDoSoftware.value && isOffice365FiveLicenses.value) {
    if (intl.language.value === 'en') return 'Original Office 365 License for PC and Mac – Instant Delivery'
    if (intl.language.value === 'es') return 'Licencia original de Office 365 para PC y Mac – Entrega inmediata'
    return 'Licença Office 365 Original para PC e Mac – Entrega Instantânea'
  }
  return String(safeProduct.value.nome || '')
})
const baseUrl = useSiteUrl()

const canonicalUrl = computed(() => {
  const s = String(slug || '').trim()
  if (!s) return baseUrl ? `${baseUrl}/` : ''
  const segment = lang.value === 'en' ? 'product' : 'produto'
  return baseUrl ? `${baseUrl}/${segment}/${s}` : ''
})

const asyncProductKey = computed(() => `product-${String(slug || '')}-${String(lang.value || 'pt')}`)

const { data: product, pending, error } = await useAsyncData(
  asyncProductKey.value,
  () => requestFetch(`/api/products/${slug}?lang=${encodeURIComponent(String(lang.value || 'pt'))}`),
  {
    server: true,
    lazy: false,
    watch: [lang],
    default: () => null
  }
)

if (process.server) {
  const statusCode = Number(
    (error.value as any)?.statusCode ||
    (error.value as any)?.status ||
    (error.value as any)?.data?.statusCode ||
    (error.value as any)?.response?.status ||
    0
  )
  const statusMessage =
    (error.value as any)?.statusMessage ||
    (error.value as any)?.data?.statusMessage ||
    'Erro no servidor'
  if (statusCode && statusCode !== 404) {
    throw createError({ statusCode, statusMessage, fatal: true })
  }
  if (!product.value) {
    throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado', fatal: true })
  }
}

const safeProduct = computed(() => {
  const p = product.value

  if (!p) {
    return {
      nome: '',
      descricao: '',
      descricaoCurta: '',
      preco: 0,
      imagem: '/products/placeholder.png'
    }
  }

  const nomeRaw = (p as any).nome ?? ''
  const nameRaw = (p as any).name ?? ''
  const nome = intl.language.value === 'pt' ? nomeRaw || nameRaw : nameRaw || nomeRaw
  const descricaoBase = (p as any).descricao ?? (p as any).description ?? ''
  const preco = Number((p as any).preco ?? (p as any).price ?? 0)
  const slugValue = (p as any).slug ?? ''

  const descricaoCurtaFromDb =
    (p as any).descricaoCurta ?? (p as any).shortDescription ?? (p as any).descricao_resumo ?? (p as any).resumo ?? ''

  const descricaoCurtaBase = String(descricaoCurtaFromDb || descricaoBase || '')
    .replace(/\s+/g, ' ')
    .trim()

  const descricaoCurta = descricaoCurtaBase.length > 220 ? `${descricaoCurtaBase.slice(0, 220)}...` : descricaoCurtaBase
  const descricaoLonga = String(descricaoBase || descricaoCurta || '').trim()

  return {
    ...p,
    nome,
    preco,
    imagem: (p as any).image || (p as any).imagem || '/products/placeholder.svg',
    slug: slugValue,
    currency: (p as any).currency || null,
    precoAntigo: Number((p as any).precoAntigo ?? (p as any).old_price ?? 0) || null,
    tutorialTitulo: (p as any).tutorialTitle || (p as any).tutorialTitulo || null,
    tutorialSubtitulo: (p as any).tutorialSubtitle || (p as any).tutorialSubtitulo || 'Aprenda como ativar seu produto passo a passo com nosso guia completo e detalhado.',
    descricaoCurta,
    descricao: descricaoLonga
  }
})

const primaryCategorySlug = computed(() => {
  const raw = (safeProduct.value as any)?.categories
  if (!Array.isArray(raw)) return ''
  const first = String(raw.find((x: any) => String(x || '').trim()) || '').trim()
  return first
})

const primaryCategoryLabel = computed(() => {
  const s = String(primaryCategorySlug.value || '').trim()
  if (!s) return ''
  const pretty = s.replace(/[-_]+/g, ' ').trim()
  return pretty ? (pretty.charAt(0).toUpperCase() + pretty.slice(1)) : s
})

const viewItemTracked = ref(false)

watch(
  () => safeProduct.value,
  (p) => {
    if (!import.meta.client) return
    if (viewItemTracked.value) return
    if (!p || !(p as any).id) return
    viewItemTracked.value = true

    try {
      trackViewItem(p)
    } catch {
      // ignore
    }
  },
  { immediate: true }
)

const safeImage = computed(() => {
  const image = String((safeProduct.value as any)?.imagem || '')
  if (!image) return '/products/placeholder.svg'

  if (image.startsWith('http://')) {
    return image.replace(/^http:\/\//, 'https://')
  }

  return image
})

const absoluteImageUrl = computed(() => {
  const raw = String(safeImage.value || '').trim()
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  const origin = String(baseUrl || '').trim()
  if (!origin) return raw
  if (!raw.startsWith('/')) return `${origin}/${raw}`
  return `${origin}${raw}`
})

const seoTitle = computed(() => {
  const customSeoTitle = String((safeProduct.value as any)?.seoTitle || '').trim()
  if (customSeoTitle) return customSeoTitle

  const slugValue = String((safeProduct.value as any)?.slug || slug || '').trim().toLowerCase()
  const lang = intl.language.value
  const base = String(siteName || 'Casa do Software')

  if (isCasaDoSoftware.value) {
    if (slugValue.includes('windows-11') && slugValue.includes('pro')) {
      if (lang === 'en') return `Windows 11 Pro Original License – Instant Activation | ${base}`
      if (lang === 'es') return `Licencia Windows 11 Pro Original – Activación Inmediata | ${base}`
      if (lang === 'fr') return `Licence Windows 11 Pro Originale – Activation Instantanée | ${base}`
      if (lang === 'it') return `Licenza Windows 11 Pro Originale – Attivazione Immediata | ${base}`
      return `Licença Windows 11 Pro Original – Ativação Imediata | ${base}`
    }
    if (slugValue.includes('windows-10') && slugValue.includes('pro')) {
      if (lang === 'en') return `Windows 10 Pro Original License – Lifetime Digital Key | ${base}`
      if (lang === 'es') return `Licencia Windows 10 Pro Original – Clave Digital Vitalicia | ${base}`
      if (lang === 'fr') return `Licence Windows 10 Pro Originale – Clé Numérique à Vie | ${base}`
      if (lang === 'it') return `Licenza Windows 10 Pro Originale – Chiave Digitale a Vita | ${base}`
      return `Windows 10 Pro Original – Licença Digital Vitalícia | ${base}`
    }
    if (slugValue.includes('office') && (slugValue.includes('365') || slugValue.includes('microsoft-365'))) {
      if (isOffice365FiveLicenses.value) {
        if (lang === 'en') return `Original Microsoft 365 License – 5 Devices, 1TB OneDrive | ${base}`
        if (lang === 'es') return `Licencia Microsoft 365 Original – 5 Dispositivos, 1TB OneDrive | ${base}`
        if (lang === 'fr') return `Licence Microsoft 365 Originale – 5 Appareils, 1To OneDrive | ${base}`
        if (lang === 'it') return `Licenza Microsoft 365 Originale – 5 Dispositivi, 1TB OneDrive | ${base}`
        return `Licença Microsoft 365 Original PC e Mac | Entrega imediata`
      }
      if (lang === 'en') return `Buy Microsoft Office 365 License – Instant Delivery | ${base}`
      if (lang === 'es') return `Comprar Licencia Microsoft Office 365 – Entrega Inmediata | ${base}`
      if (lang === 'fr') return `Acheter Licence Microsoft Office 365 – Livraison Instantanée | ${base}`
      if (lang === 'it') return `Acquista Licenza Microsoft Office 365 – Consegna Immediata | ${base}`
      return `Office 365 Original – Licença Oficial com Entrega Imediata`
    }
    if (slugValue.includes('office') && slugValue.includes('2021')) {
      if (lang === 'en') return `Microsoft Office 2021 Original – Lifetime Activation Key | ${base}`
      if (lang === 'es') return `Microsoft Office 2021 Original – Clave de Activación Vitalicia | ${base}`
      if (lang === 'fr') return `Microsoft Office 2021 Original – Clé d'Activation à Vie | ${base}`
      if (lang === 'it') return `Microsoft Office 2021 Originale – Chiave Attivazione a Vita | ${base}`
      return `Office 2021 Original – Chave de Ativação Vitalícia | ${base}`
    }
  }

  const name = String((safeProduct.value as any)?.nome || '').trim()
  if (name) {
    if (lang === 'en') return `Buy ${name} – Instant Digital Delivery | ${base}`
    if (lang === 'es') return `Comprar ${name} – Entrega Digital Inmediata | ${base}`
    if (lang === 'fr') return `Acheter ${name} – Livraison Numérique Instantanée | ${base}`
    if (lang === 'it') return `Acquista ${name} – Consegna Digitale Immediata | ${base}`
    return `${name} | ${base}`
  }
  return base
})

const seoDescription = computed(() => {
  const customSeoDesc = String((safeProduct.value as any)?.seoDescription || '').trim()
  if (customSeoDesc) return customSeoDesc

  const slugValue = String((safeProduct.value as any)?.slug || slug || '').trim().toLowerCase()
  const lang = intl.language.value

  if (isCasaDoSoftware.value) {
    if (slugValue.includes('windows-11') && slugValue.includes('pro')) {
      if (lang === 'en') return 'Buy Windows 11 Pro original license with lifetime key and instant delivery. Install and activate in minutes with full support. Secure payment!'
      if (lang === 'es') return '¡Compra tu licencia original de Windows 11 Pro con clave vitalicia y entrega inmediata. Instala y activa en minutos con soporte completo!'
      if (lang === 'fr') return 'Achetez votre licence Windows 11 Pro originale avec clé à vie et livraison instantanée. Installation simple avec assistance complète!'
      if (lang === 'it') return 'Acquista la licenza originale di Windows 11 Pro con chiave a vita e consegna immediata. Attiva in pochi minuti con supporto completo!'
      return 'Windows 11 Pro original com chave vitalícia e entrega na hora. Instale e ative em minutos com suporte completo. Compra segura!'
    }
    if (slugValue.includes('windows-10') && slugValue.includes('pro')) {
      if (lang === 'en') return 'Buy Windows 10 Pro original with instant activation and lifetime guarantee. Digital license for PC or laptop. Support included!'
      if (lang === 'es') return 'Compra Windows 10 Pro original con activación instantánea y garantía vitalicia. Licencia digital para PC o portátil. ¡Soporte incluido!'
      if (lang === 'fr') return 'Achetez Windows 10 Pro original avec activation instantanée et garantie à vie. Licence numérique pour PC ou ordinateur portable. Support inclus!'
      if (lang === 'it') return 'Acquista Windows 10 Pro originale con attivazione immediata e garanzia a vita. Licenza digitale per PC o laptop. Supporto incluso!'
      return 'Compre Windows 10 Pro original com ativação instantânea e garantia. Licença vitalícia para PC ou notebook. Suporte incluso!'
    }
    if (slugValue.includes('office') && (slugValue.includes('365') || slugValue.includes('microsoft-365'))) {
      if (isOffice365FiveLicenses.value) {
        if (lang === 'en') return 'Buy original Microsoft 365 license for up to 5 devices. Fast activation, official account, 1TB OneDrive storage. Instant delivery by email!'
        if (lang === 'es') return 'Compra tu licencia Microsoft 365 original para hasta 5 dispositivos. Activación rápida, cuenta oficial y 1TB de almacenamiento. ¡Entrega inmediata!'
        if (lang === 'fr') return 'Achetez votre licence Microsoft 365 originale pour jusqu\'à 5 appareils. Activation rapide, compte officiel, 1To OneDrive. Livraison instantanée!'
        if (lang === 'it') return 'Acquista la tua licenza Microsoft 365 originale per fino a 5 dispositivi. Attivazione rapida, account ufficiale, 1TB OneDrive. Consegna immediata!'
        return 'Comprar licença do pacote Office permanente nunca foi tão fácil. Original, ativação rápida, conta oficial, suporte completo e envio imediato por email.'
      }
      if (lang === 'en') return 'Original Microsoft Office 365 for PC and Mac. Fast activation, official account and full support. Get it now by email!'
      if (lang === 'es') return 'Microsoft Office 365 original para PC y Mac. Activación rápida, cuenta oficial y soporte completo. ¡Recíbelo ahora por email!'
      if (lang === 'fr') return 'Microsoft Office 365 original pour PC et Mac. Activation rapide, compte officiel et support complet. Recevez-le maintenant par email!'
      if (lang === 'it') return 'Microsoft Office 365 originale per PC e Mac. Attivazione rapida, account ufficiale e supporto completo. Ricevilo ora per email!'
      return 'Microsoft Office 365 original para PC e Mac. Ativação rápida, conta oficial e suporte completo. Receba agora por e-mail!'
    }
    if (slugValue.includes('office') && slugValue.includes('2021')) {
      if (lang === 'en') return 'Buy Microsoft Office 2021 original with permanent key and simple installation. Instant delivery and secure payment. Activate in minutes!'
      if (lang === 'es') return '¡Compra Microsoft Office 2021 original con clave permanente e instalación simple. Entrega inmediata y pago seguro. Actívalo en minutos!'
      if (lang === 'fr') return 'Achetez Microsoft Office 2021 original avec clé permanente et installation simple. Livraison instantanée et paiement sécurisé. Activez en minutes!'
      if (lang === 'it') return 'Acquista Microsoft Office 2021 originale con chiave permanente e installazione semplice. Consegna immediata e pagamento sicuro. Attiva in minuti!'
      return 'Licença Office 2021 original com chave permanente e instalação simples. Entrega imediata e pagamento seguro. Ative em minutos!'
    }
  }

  const rawShort = String((safeProduct.value as any)?.descricaoCurta || '').trim()
  const rawLong = String((safeProduct.value as any)?.descricao || '').trim()

  const raw = rawShort || rawLong
  if (!raw) return ''

  const textOnly = safeSanitize(raw, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, ' ')
    .trim()

  return textOnly.length > 155 ? textOnly.slice(0, 155) : textOnly
})

useHead(() => {
  const title = seoTitle.value
  const description = seoDescription.value
  const selfCanonical = canonicalUrl.value
  const link: any[] = [
    ...(selfCanonical ? [{ rel: 'canonical', href: selfCanonical }] : []),
    ...(productHreflang.value as any[])
  ]

  const p = safeProduct.value as any
  const hasProduct = !pending.value && !error.value && String(p?.nome || '').trim()

  if (!hasProduct) {
    return {
      title,
      meta: [{ name: 'description', content: description }],
      link
    }
  }

  const price = Number(p?.preco || 0)
  const priceCurrency = String(p?.currency || intl.currency.value || 'BRL').trim().toUpperCase()

  const productJsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: String(p?.nome || '').trim() || undefined,
    description: String(description || '').trim() || undefined,
    image: absoluteImageUrl.value ? [absoluteImageUrl.value] : undefined,
    sku: String(p?.id || '').trim() || undefined,
    brand: {
      '@type': 'Brand',
      name: String(siteName || 'Casa do Software')
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl.value || undefined,
      priceCurrency,
      price: price > 0 ? price : undefined,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  }

  const homeUrl = selfCanonical ? selfCanonical.replace(/\/(?:en|es|fr|it)\/.*|\/produto\/.*|\/product\/.*|\/producto\/.*|\/produit\/.*|\/prodotto\/.*/, '/') : '/'
  const breadcrumbJsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: siteName || 'Casa do Software', item: homeUrl },
      { '@type': 'ListItem', position: 2, name: String(p?.nome || '').trim() || 'Produto', item: selfCanonical || '' }
    ]
  }

  return {
    title,
    meta: [{ name: 'description', content: description }],
    link,
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([productJsonLd, breadcrumbJsonLd])
      }
    ]
  }
})

const seoMetaTitle = computed(() => seoTitle.value)
const seoMetaDescription = computed(() => seoDescription.value)
useSeoMeta({
  title: seoMetaTitle,
  description: seoMetaDescription,
  ogTitle: seoMetaTitle,
  ogDescription: seoMetaDescription,
  twitterTitle: seoMetaTitle,
  twitterDescription: seoMetaDescription
})

const safeDescriptionHtml = computed(() => {
  const raw = String((safeProduct.value as any)?.descricao || '').trim()
  if (!raw) return ''

  const hasHtml = /<\s*\/?\s*[a-z][\s\S]*>/i.test(raw)
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const isSimpleHtmlForConversion = (html: string) => {
    // Consider HTML "simple" when it only uses wrappers / line-break tags.
    // In this case we can safely convert it back to text lines and apply ##/### headings.
    const stripped = html
      .replace(/<\s*br\b[^>]*>/gi, '')
      .replace(/<\/?\s*(p|div|span)\b[^>]*>/gi, '')
      .trim()

    return !/<\s*\/?\s*[a-z][\s\S]*>/i.test(stripped)
  }

  const htmlToTextLines = (html: string) => {
    return html
      .replace(/<\s*br\b[^>]*>/gi, '\n')
      .replace(/<\s*\/\s*(p|div)\s*>/gi, '\n')
      .replace(/<\s*(p|div)\b[^>]*>/gi, '')
      .replace(/<\/?\s*span\b[^>]*>/gi, '')
      .replace(/&nbsp;/gi, ' ')
  }

  const convertHeadingsInsideHtml = (html: string) => {
    let out = html

    // Handle common block wrappers.
    out = out.replace(
      /<(p|div|li|span)(\s[^>]*)?>\s*###\s*([\s\S]*?)\s*<\/\1>/gi,
      '<h3>$3</h3>'
    )
    out = out.replace(
      /<(p|div|li|span)(\s[^>]*)?>\s*##\s*([\s\S]*?)\s*<\/\1>/gi,
      '<h2>$3</h2>'
    )

    // Handle cases where the marker is wrapped by inner tags (e.g. <p><strong>## Title</strong></p>).
    out = out.replace(
      /<(p|div|li|span)(\s[^>]*)?>\s*(?:<[^>]+>\s*)*###\s*([\s\S]*?)\s*(?:<\/[^>]+>\s*)*<\/\1>/gi,
      '<h3>$3</h3>'
    )
    out = out.replace(
      /<(p|div|li|span)(\s[^>]*)?>\s*(?:<[^>]+>\s*)*##\s*([\s\S]*?)\s*(?:<\/[^>]+>\s*)*<\/\1>/gi,
      '<h2>$3</h2>'
    )

    // Handle headings after line breaks (keeps the rest of the HTML intact).
    // Capture until the next <br ...> so the heading content may contain tags (e.g. <strong>).
    out = out.replace(
      /(<\s*br\b[^>]*>\s*)###\s*([\s\S]*?)(?=<\s*br\b[^>]*>|$)/gi,
      '$1<h3>$2</h3>'
    )
    out = out.replace(
      /(<\s*br\b[^>]*>\s*)##\s*([\s\S]*?)(?=<\s*br\b[^>]*>|$)/gi,
      '$1<h2>$2</h2>'
    )

    // Handle headings right after an opening tag (e.g. <p>## Title<br ...> or <p><strong>## Title</strong><br ...>).
    // We stop at the next <br ...> or end-of-block to avoid swallowing subsequent content.
    out = out.replace(
      /(>\s*)(?:<[^>]+>\s*)*###\s*([\s\S]*?)(?=<\s*br\b[^>]*>|<\/\s*(p|div|li|span)\b|$)/gi,
      '$1<h3>$2</h3>'
    )
    out = out.replace(
      /(>\s*)(?:<[^>]+>\s*)*##\s*([\s\S]*?)(?=<\s*br\b[^>]*>|<\/\s*(p|div|li|span)\b|$)/gi,
      '$1<h2>$2</h2>'
    )

    // Handle headings at the beginning of the HTML.
    out = out.replace(/^\s*###\s*([^<\n\r]+)/i, '<h3>$1</h3>')
    out = out.replace(/^\s*##\s*([^<\n\r]+)/i, '<h2>$1</h2>')

    return out
  }

  const renderPlainText = (text: string) => {
    const lines = text.replace(/\r\n/g, '\n').split('\n')
    return lines
      .map((line) => {
        if (isCasaDoSoftware.value) {
          const h3 = line.match(/^\s*###\s*(.+)\s*$/)
          if (h3) return `<h3>${escapeHtml(h3[1] || '')}</h3>`

          const h2 = line.match(/^\s*##\s*(.+)\s*$/)
          if (h2) return `<h2>${escapeHtml(h2[1] || '')}</h2>`
        }

        return escapeHtml(line)
      })
      .join('<br />')
  }

  const normalized = (() => {
    if (!hasHtml) return renderPlainText(raw)

    if (isCasaDoSoftware.value && isSimpleHtmlForConversion(raw)) {
      return renderPlainText(htmlToTextLines(raw))
    }

    if (isCasaDoSoftware.value && /##|###/.test(raw)) {
      return convertHeadingsInsideHtml(raw)
    }

    return raw
  })()

  return safeSanitize(normalized, {
    USE_PROFILES: { html: true }
  })
})

const safeSeoContentHtml = computed(() => {
  const raw = String((safeProduct.value as any)?.seoContent || '').trim()
  if (!raw) return ''
  return safeSanitize(raw, {
    USE_PROFILES: { html: true }
  })
})

function onImageError(e: Event) {
  const el = e.target as HTMLImageElement | null
  if (!el) return
  if (el.src.endsWith('/products/placeholder.svg')) return
  el.src = '/products/placeholder.svg'
}

const isBrl = computed(() => intl.currencyLower.value === 'brl')

const formattedPrice = computed(() => {
  const currencyLower = String((safeProduct.value as any)?.currency || intl.currencyLower.value).trim().toLowerCase()
  const currency = currencyLower === 'usd' ? 'USD' : currencyLower === 'eur' ? 'EUR' : 'BRL'
  return Number(safeProduct.value.preco || 0).toLocaleString(intl.locale.value, {
    style: 'currency',
    currency
  })
})

const formattedOldPrice = computed(() => {
  const oldPrice = (safeProduct.value as any).precoAntigo
  if (!oldPrice || Number.isNaN(Number(oldPrice))) return null
  if (Number(oldPrice) <= Number(safeProduct.value.preco || 0)) return null

  const currencyLower = String((safeProduct.value as any)?.currency || intl.currencyLower.value).trim().toLowerCase()
  const currency = currencyLower === 'usd' ? 'USD' : currencyLower === 'eur' ? 'EUR' : 'BRL'
  return Number(oldPrice).toLocaleString(intl.locale.value, {
    style: 'currency',
    currency
  })
})

const discountPercent = computed(() => {
  const oldPrice = (safeProduct.value as any).precoAntigo
  const current = Number(safeProduct.value.preco || 0)
  if (!oldPrice || !current) return null
  const oldN = Number(oldPrice)
  if (!oldN || oldN <= current) return null
  return Math.round((1 - current / oldN) * 100)
})

const formattedPixPrice = computed(() => {
  if (!isBrl.value) return null
  const price = Number(safeProduct.value.preco || 0)
  if (!price) return null
  const pixPrice = Math.round(price * 0.95 * 100) / 100
  if (pixPrice === price) return null
  return pixPrice.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const installments12 = computed(() => {
  if (!isBrl.value) return null
  const price = Number(safeProduct.value.preco || 0)
  if (!price) return null
  const value = Math.round((price / 12) * 100) / 100
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const defaultIncludedItems = computed(() => {
  if (intl.language.value === 'en') {
    return [
      'Fast delivery after confirmation',
      'Permanent digital license',
      'Business hours support',
      '1 PC',
      'Professional version with advanced features',
      'Compatible with Windows 10 and 11',
      'Permanent activation',
      'No renewal required'
    ]
  }

  if (intl.language.value === 'es') {
    return [
      'Envío rápido tras la confirmación',
      'Licencia digital permanente',
      'Soporte en horario comercial',
      '1 PC',
      'Versión profesional con funciones avanzadas',
      'Compatible con Windows 10 y 11',
      'Activación permanente',
      'Sin renovación'
    ]
  }

  if (intl.language.value === 'it') {
    return [
      'Consegna rapida dopo la conferma',
      'Licenza digitale permanente',
      'Supporto negli orari di ufficio',
      '1 PC',
      'Versione professionale con funzionalità avanzate',
      'Compatibile con Windows 10 e 11',
      'Attivazione permanente',
      'Nessun rinnovo necessario'
    ]
  }

  if (intl.language.value === 'fr') {
    return [
      'Livraison rapide après confirmation',
      'Licence numérique permanente',
      'Support pendant les heures ouvrées',
      '1 PC',
      'Version professionnelle avec fonctionnalités avancées',
      'Compatible avec Windows 10 et 11',
      'Activation permanente',
      'Aucun renouvellement requis'
    ]
  }

  return [
    'Envio imediato após confirmação',
    'Licença digital permanente',
    'Suporte em horário comercial',
    '1 PC',
    'Versão profissional com recursos avançados',
    'Compatível Windows 10 e 11',
    'Ativação permanente',
    'Sem renovação necessária'
  ]
})

const includedItems = computed(() => {
  const raw = String((safeProduct.value as any)?.cardItems ?? '').trim()
  if (!raw) return defaultIncludedItems.value
  const items = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (!items.length) return defaultIncludedItems.value

  if (intl.language.value === 'pt') return items

  const dictEn: Record<string, string> = {
    'Envio imediato após confirmação': 'Fast delivery after confirmation',
    'Envio rápido após confirmação': 'Fast delivery after confirmation',
    'Licença digital permanente': 'Permanent digital license',
    'Licença digital com ativação permanente': 'Digital license with permanent activation',
    'Licença digital': 'Digital license',
    'Suporte 24/7': '24/7 support',
    'Suporte em horário comercial': 'Business hours support',
    '1 PC': '1 PC',
    'Compatível Windows 10 e 11': 'Compatible with Windows 10 and 11',
    'Ativação permanente': 'Permanent activation',
    'Sem renovação necessária': 'No renewal required',
    'Sem renovação': 'No renewal required',
    'Versão profissional com recursos avançados': 'Professional version with advanced features',
    'Acesso digital com conta ativa': 'Digital access with active account',
    'Uso durante o período contratado': 'Use during contracted period',
    'Uso contínuo sem mensalidade': 'Continuous use, no monthly fee',
    '5 PC , MAC , IOS , Tablet e Celular': '5 PCs, Mac, iOS, Tablet and Mobile',
    '5 PC , MAC , iOS , Tablet e Celular': '5 PCs, Mac, iOS, Tablet and Mobile',
    '5 PC, MAC , IOS , Tablet e Celular': '5 PCs, Mac, iOS, Tablet and Mobile',
    '5 PC, MAC , iOS , Tablet e Celular': '5 PCs, Mac, iOS, Tablet and Mobile',
    '5 PC, MAC, iOS, Tablet e Celular': '5 PCs, Mac, iOS, Tablet and Mobile',
    '5 PC, MAC, IOS, Tablet e Celular': '5 PCs, Mac, iOS, Tablet and Mobile',
    'Atualização gratuita': 'Free updates',
    'Atualizações gratuitas': 'Free updates',
    'Sem mensalidade': 'No monthly fee',
    'Uso vitalício': 'Lifetime use',
    'Chave ESD': 'ESD Key',
    'Instalação simples': 'Easy installation'
  }

  const dictEs: Record<string, string> = {
    'Envio imediato após confirmação': 'Envío rápido tras la confirmación',
    'Envio rápido após confirmação': 'Envío rápido tras la confirmación',
    'Licença digital permanente': 'Licencia digital permanente',
    'Licença digital com ativação permanente': 'Licencia digital con activación permanente',
    'Licença digital': 'Licencia digital',
    'Suporte 24/7': 'Soporte 24/7',
    'Suporte em horário comercial': 'Soporte en horario comercial',
    '1 PC': '1 PC',
    'Compatível Windows 10 e 11': 'Compatible con Windows 10 y 11',
    'Ativação permanente': 'Activación permanente',
    'Sem renovação necessária': 'Sin renovación',
    'Sem renovação': 'Sin renovación',
    'Versão profissional com recursos avançados': 'Versión profesional con funciones avanzadas',
    'Acesso digital com conta ativa': 'Acceso digital con cuenta activa',
    'Uso durante o período contratado': 'Uso durante el período contratado',
    'Uso contínuo sem mensalidade': 'Uso continuo sin mensualidad',
    'Atualização gratuita': 'Actualización gratuita',
    'Atualizações gratuitas': 'Actualizaciones gratuitas',
    'Sem mensalidade': 'Sin mensualidad',
    'Uso vitalício': 'Uso de por vida',
    'Chave ESD': 'Clave ESD',
    'Instalação simples': 'Instalación sencilla'
  }

  const dictIt: Record<string, string> = {
    'Envio imediato após confirmação': 'Consegna rapida dopo la conferma',
    'Envio rápido após confirmação': 'Consegna rapida dopo la conferma',
    'Licença digital permanente': 'Licenza digitale permanente',
    'Licença digital com ativação permanente': 'Licenza digitale con attivazione permanente',
    'Licença digital': 'Licenza digitale',
    'Suporte 24/7': 'Supporto 24/7',
    'Suporte em horário comercial': 'Supporto negli orari di ufficio',
    '1 PC': '1 PC',
    'Compatível Windows 10 e 11': 'Compatibile con Windows 10 e 11',
    'Ativação permanente': 'Attivazione permanente',
    'Sem renovação necessária': 'Nessun rinnovo necessario',
    'Sem renovação': 'Nessun rinnovo necessario',
    'Versão profissional com recursos avançados': 'Versione professionale con funzionalità avanzate',
    'Acesso digital com conta ativa': 'Accesso digitale con account attivo',
    'Uso durante o período contratado': 'Utilizzo durante il periodo contrattuale',
    'Uso contínuo sem mensalidade': 'Uso continuato senza canone mensile',
    'Atualização gratuita': 'Aggiornamento gratuito',
    'Atualizações gratuitas': 'Aggiornamenti gratuiti',
    'Sem mensalidade': 'Nessun canone mensile',
    'Uso vitalício': 'Uso a vita',
    'Chave ESD': 'Chiave ESD',
    'Instalação simples': 'Installazione semplice'
  }

  const dictFr: Record<string, string> = {
    'Envio imediato após confirmação': 'Livraison rapide après confirmation',
    'Envio rápido após confirmação': 'Livraison rapide après confirmation',
    'Licença digital permanente': 'Licence numérique permanente',
    'Licença digital com ativação permanente': 'Licence numérique avec activation permanente',
    'Licença digital': 'Licence numérique',
    'Suporte 24/7': 'Support 24/7',
    'Suporte em horário comercial': 'Support pendant les heures ouvrées',
    '1 PC': '1 PC',
    'Compatível Windows 10 e 11': 'Compatible avec Windows 10 et 11',
    'Ativação permanente': 'Activation permanente',
    'Sem renovação necessária': 'Aucun renouvellement requis',
    'Sem renovação': 'Aucun renouvellement requis',
    'Versão profissional com recursos avançados': 'Version professionnelle avec fonctionnalités avancées',
    'Acesso digital com conta ativa': 'Accès numérique avec compte actif',
    'Uso durante o período contratado': "Utilisation pendant la durée du contrat",
    'Uso contínuo sem mensalidade': 'Utilisation continue sans abonnement mensuel',
    'Atualização gratuita': 'Mise à jour gratuite',
    'Atualizações gratuitas': 'Mises à jour gratuites',
    'Sem mensalidade': 'Sans abonnement mensuel',
    'Uso vitalício': 'Utilisation à vie',
    'Chave ESD': 'Clé ESD',
    'Instalação simples': 'Installation simple'
  }

  const lang = intl.language.value
  const dict = lang === 'en' ? dictEn : lang === 'es' ? dictEs : lang === 'it' ? dictIt : dictFr

  function looksLikePt(s: string): boolean {
    return /[ãçõ]|após|contratado|vitalí|mensalidade|imediato|horário|comercial|ativação|atualiz|instala|gratuita|simples|contínuo/i.test(s)
  }

  return items
    .map((it) => dict[it] ?? (looksLikePt(it) ? '' : it))
    .filter(Boolean)
})

const isMicrosoft365 = computed(() => {
  const nome = String((safeProduct.value as any)?.nome || '').toLowerCase()
  const slugValue = String((safeProduct.value as any)?.slug || '').toLowerCase()
  return (
    nome.includes('microsoft 365') ||
    nome.includes('office 365') ||
    slugValue.includes('microsoft-365') ||
    slugValue.includes('office-365') ||
    slugValue.includes('365')
  )
})

const t = computed(() => {
  if (intl.language.value === 'en') {
    return {
      home: 'Home',
      products: 'Products',
      loading: 'Loading product...',
      notFound: 'Product not found.',
      buy: 'Buy',
      included: "What's included:",
      installmentsPrefix: 'up to 12x of',
      pixLabel: 'PIX upfront payment',
      digitalDelivery: 'Digital delivery • Available',
      freeRefund: 'Free refund up to 7 days after purchase',
      guarantee: 'Guaranteed purchase. If you are not satisfied, we refund you',
      emailDelivery: 'Delivered by email after confirmation',
      tutorialCardTitle: 'Activation tutorial',
      viewTutorial: 'View tutorial',
      detailedDescription: 'Detailed description',
      whyPriceTitle: 'Why is our price more affordable?',
      whyPriceP1: 'Our prices are more affordable because we work with digital distribution, with no physical media, logistics, or middleman costs.',
      whyPriceP2: 'This allows us to offer competitive prices while keeping support and fast delivery after payment confirmation.',
      ms365HowTitle: 'Microsoft 365 / Office 365 — how it works',
      ms365Bullet1: '',
      ms365Bullet2: 'Delivery via a provided account (login and password) after payment confirmation.',
      ms365Bullet3: 'Access is via the provided account (it is not activation on an existing personal Microsoft account).',
      ms365HelpPrefix: 'Questions? See',
      ms365HelpLink: 'Digital delivery'
    }
  }

  if (intl.language.value === 'es') {
    return {
      home: 'Inicio',
      products: 'Productos',
      loading: 'Cargando producto...',
      notFound: 'Producto no encontrado.',
      buy: 'Comprar',
      included: 'Qué incluye:',
      installmentsPrefix: 'hasta 12x de',
      pixLabel: 'Pago al contado con PIX',
      digitalDelivery: 'Entrega digital • Disponible',
      freeRefund: 'Devolución gratis hasta 7 días después de la compra',
      guarantee: 'Compra garantizada. Si no queda satisfecho, le devolvemos su dinero',
      emailDelivery: 'Envío por e-mail tras la confirmación',
      tutorialCardTitle: 'Tutorial de activación',
      viewTutorial: 'Ver tutorial',
      detailedDescription: 'Descripción detallada',
      whyPriceTitle: '¿Por qué nuestro precio es más accesible?',
      whyPriceP1: 'Nuestros precios son más accesibles porque trabajamos con distribución digital, sin costos de medios físicos, logística ni intermediarios.',
      whyPriceP2: 'Esto nos permite ofrecer valores competitivos, manteniendo soporte y entrega rápida tras la confirmación del pago.',
      ms365HowTitle: 'Microsoft 365 / Office 365 — cómo funciona',
      ms365Bullet1: '',
      ms365Bullet2: 'Entrega mediante una cuenta proporcionada (usuario y contraseña) tras la confirmación del pago.',
      ms365Bullet3: 'El acceso se realiza con la cuenta proporcionada (no es activación en una cuenta Microsoft personal ya existente).',
      ms365HelpPrefix: '¿Dudas? Consulta',
      ms365HelpLink: 'Entrega digital'
    }
  }

  if (intl.language.value === 'it') {
    return {
      home: 'Home',
      products: 'Prodotti',
      loading: 'Caricamento prodotto...',
      notFound: 'Prodotto non trovato.',
      buy: 'Acquista',
      included: "Cosa è incluso:",
      installmentsPrefix: 'fino a 12x da',
      pixLabel: 'Pagamento in contanti con PIX',
      digitalDelivery: 'Consegna digitale • Disponibile',
      freeRefund: 'Rimborso gratuito fino a 7 giorni dopo l’acquisto',
      guarantee: 'Acquisto garantito. Se non sei soddisfatto, rimborsiamo',
      emailDelivery: 'Consegnato via email dopo la conferma',
      tutorialCardTitle: 'Tutorial di attivazione',
      viewTutorial: 'Vedi tutorial',
      detailedDescription: 'Descrizione dettagliata',
      whyPriceTitle: 'Perché il nostro prezzo è più conveniente?',
      whyPriceP1: 'I nostri prezzi sono più convenienti perché lavoriamo con distribuzione digitale, senza costi di supporti fisici, logistica o intermediari.',
      whyPriceP2: 'Questo ci permette di offrire prezzi competitivi, mantenendo supporto e consegna rapida dopo la conferma del pagamento.',
      ms365HowTitle: 'Microsoft 365 / Office 365 — come funziona',
      ms365Bullet1: '',
      ms365Bullet2: 'Consegna tramite un account fornito (login e password) dopo la conferma del pagamento.',
      ms365Bullet3: "L'accesso avviene con l'account fornito (non è un’attivazione su un account Microsoft personale già esistente).",
      ms365HelpPrefix: 'Dubbi? Vedi',
      ms365HelpLink: 'Consegna digitale'
    }
  }

  if (intl.language.value === 'fr') {
    return {
      home: 'Accueil',
      products: 'Produits',
      loading: 'Chargement du produit...',
      notFound: 'Produit introuvable.',
      buy: 'Acheter',
      included: 'Ce qui est inclus :',
      installmentsPrefix: "jusqu'à 12x de",
      pixLabel: 'Paiement comptant avec PIX',
      digitalDelivery: 'Livraison numérique • Disponible',
      freeRefund: 'Remboursement gratuit jusqu’à 7 jours après l’achat',
      guarantee: 'Achat garanti. Si vous n’êtes pas satisfait, nous remboursons',
      emailDelivery: 'Livré par e-mail après confirmation',
      tutorialCardTitle: "Tutoriel d’activation",
      viewTutorial: 'Voir le tutoriel',
      detailedDescription: 'Description détaillée',
      whyPriceTitle: 'Pourquoi notre prix est-il plus abordable ?',
      whyPriceP1: 'Nos prix sont plus abordables car nous travaillons avec une distribution numérique, sans coûts de support physique, de logistique ou d’intermédiaires.',
      whyPriceP2: 'Cela nous permet de proposer des prix compétitifs tout en maintenant le support et une livraison rapide après confirmation du paiement.',
      ms365HowTitle: 'Microsoft 365 / Office 365 — comment ça marche',
      ms365Bullet1: '',
      ms365Bullet2: 'Livraison via un compte fourni (identifiant et mot de passe) après confirmation du paiement.',
      ms365Bullet3: "L'accès se fait avec le compte fourni (ce n'est pas une activation sur un compte Microsoft personnel existant).",
      ms365HelpPrefix: 'Des questions ? Voir',
      ms365HelpLink: 'Livraison numérique'
    }
  }

  return {
    home: 'Início',
    products: 'Produtos',
    loading: 'Carregando produto...',
    notFound: 'Produto não encontrado.',
    buy: 'Comprar',
    included: 'O que está incluído:',
    installmentsPrefix: 'em até 12x de',
    pixLabel: 'Pagamento à vista no PIX',
    digitalDelivery: 'Entrega digital • Disponível',
    freeRefund: 'Devolução grátis. Até 7 dias a partir do recebimento',
    guarantee: 'Compra garantida. Saia satisfeito ou devolvemos seu dinheiro',
    emailDelivery: 'Envio por e-mail após confirmação',
    tutorialCardTitle: 'Tutorial de Ativação',
    viewTutorial: 'Ver Tutorial',
    detailedDescription: 'Descrição Detalhada',
    whyPriceTitle: 'Por que o preço é tão bom? Entenda.',
    whyPriceP1: 'Nossos preços são mais acessíveis porque trabalhamos com distribuição digital, sem custos de mídia física, logística ou intermediários.',
    whyPriceP2: 'Isso nos permite oferecer valores competitivos, mantendo suporte e envio imediato após confirmação.',
    ms365HowTitle: 'Microsoft 365 / Office 365 — como funciona',
    ms365Bullet1: '',
    ms365Bullet2: 'Entrega por conta fornecida (login e senha) após a confirmação do pagamento.',
    ms365Bullet3: 'O acesso é feito com a conta fornecida (não é ativação em uma conta Microsoft pessoal já existente).',
    ms365HelpPrefix: 'Dúvidas? Consulte',
    ms365HelpLink: 'Entrega digital'
  }
})

function buyNow() {
  const slugValue = String((safeProduct.value as any)?.slug || slug || '')
  navigateTo({ path: '/checkout', query: { product: slugValue } })
}
</script>

<style scoped>
/* Forçar fundo transparente em v-html com estilos inline - Tailwind prose-invert cuida das cores */
.prose :deep(*) {
  background-color: transparent !important;
  background: transparent !important;
  color: #e2e8f0 !important;
}
.prose :deep(table),
.prose :deep(td),
.prose :deep(th) {
  background-color: transparent !important;
  border-color: rgba(148,163,184,0.2) !important;
}
.seo-content-dark :deep(*) {
  background-color: transparent !important;
  background: transparent !important;
  color: #e2e8f0 !important;
}
</style>
