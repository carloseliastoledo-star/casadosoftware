<template>
  <section :class="sectionClass">
    <div :class="containerClass">

      <!-- Breadcrumb -->
      <div :class="breadcrumbClass">
        <NuxtLink to="/" class="hover:underline">{{ t.home }}</NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink to="/produtos" class="hover:underline">{{ t.products }}</NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700 font-medium">{{ safeProduct.nome }}</span>
      </div>

      <!-- Título -->
      <h1 :class="titleClass">
        {{ pageH1 }}
      </h1>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-20 text-gray-500">
        {{ t.loading }}
      </div>

      <!-- Erro -->
      <div v-else-if="error || !data" class="text-center py-20 text-red-600">
        {{ t.notFound }}
      </div>

      <!-- Card principal -->
      <div
        v-else
        :class="mainCardClass"
      >

        <!-- Imagem -->
        <div :class="imageWrapClass">
          <img
            :src="safeImage"
            :alt="safeProduct.nome"
            fetchpriority="high"
            loading="eager"
            decoding="async"
            width="520"
            height="520"
            sizes="(max-width: 1024px) 100vw, 520px"
            class="w-full max-w-[520px] max-h-[520px] object-contain"
            referrerpolicy="no-referrer"
            @error="onImageError"
          />
        </div>

        <!-- Coluna compra -->
        <div :class="buyColumnClass">
          <div v-if="safeProduct.descricaoCurta" class="text-gray-600">
            {{ safeProduct.descricaoCurta }}
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <div v-if="formattedOldPrice" class="text-gray-400 line-through">
                {{ formattedOldPrice }}
              </div>

              <span
                v-if="discountPercent"
                class="inline-flex items-center rounded-full bg-green-100 text-green-700 text-xs font-semibold px-3 py-1"
              >
                {{ discountPercent }}% OFF
              </span>
            </div>

            <div class="text-4xl font-extrabold text-gray-900">
              {{ formattedPrice }}
            </div>

            <div v-if="installments12" class="text-sm text-gray-600">
              {{ t.installmentsPrefix }} {{ installments12 }}
            </div>

            <div v-if="isBrl" class="text-sm text-blue-600">
              {{ t.pixLabel }}
              <span v-if="formattedPixPrice" class="text-gray-500">({{ formattedPixPrice }})</span>
            </div>
          </div>

          <div class="space-y-2 text-sm text-gray-700">
            <div class="flex items-center gap-2">
              <span class="text-emerald-600">✔</span>
              {{ t.digitalDelivery }}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-600">✔</span>
              {{ t.freeRefund }}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-600">✔</span>
              {{ t.guarantee }}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-600">✔</span>
              {{ t.emailDelivery }}
            </div>
          </div>

          <div class="space-y-3">
            <button
              type="button"
              @click="buyNow"
              :class="buyButtonClass"
            >
              {{ t.buy }}
            </button>
          </div>

          <div class="pt-2">
            <div class="text-lg font-semibold text-gray-900 mb-3">{{ t.included }}</div>
            <ul class="mt-6 space-y-2 text-gray-700">
              <li v-for="item in includedItems" :key="item" class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 text-green-600">
                    <path
                      fill-rule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.415l-7.25 7.25a1 1 0 01-1.415 0L3.296 9.21a1 1 0 011.415-1.415l3.018 3.018 6.543-6.543a1 1 0 011.432.02z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
                <span class="text-sm">{{ item }}</span>
              </li>
            </ul>
          </div>

          <div
            v-if="isMicrosoft365"
            class="rounded-xl border bg-gray-50 p-5 text-sm text-gray-700"
          >
            <div class="font-semibold text-gray-900">{{ t.ms365HowTitle }}</div>
            <ul class="mt-3 list-disc pl-5 space-y-2">
              <li>{{ t.ms365Bullet1 }}</li>
              <li>{{ t.ms365Bullet2 }}</li>
              <li>{{ t.ms365Bullet3 }}</li>
            </ul>
            <div class="mt-3">
              {{ t.ms365HelpPrefix }} <NuxtLink class="text-blue-600 hover:underline" to="/entrega-digital">{{ t.ms365HelpLink }}</NuxtLink>.
            </div>
          </div>
        </div>
      </div>

      <!-- BLOCO AZUL TUTORIAL -->
      <div
        v-if="data && safeProduct.tutorialTitulo"
        :class="tutorialCardClass"
      >
        <div class="flex items-center gap-5">
          <div class="bg-blue-600 text-white p-4 rounded-xl text-xl">
            📘
          </div>

          <div>
            <h3 class="text-xl font-bold text-blue-700">
              {{ t.tutorialCardTitle }}
            </h3>
            <p class="text-blue-700 text-sm mt-1">
              {{ safeProduct.tutorialSubtitulo }}
            </p>
          </div>
        </div>

        <NuxtLink
          :to="`/tutoriais/${safeProduct.slug}`"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          → {{ t.viewTutorial }}
        </NuxtLink>
      </div>

      <!-- DESCRIÇÃO DETALHADA -->
      <div
        v-if="data"
        :class="descriptionCardClass"
      >
        <section>
          <h2 class="text-2xl font-bold mb-3">
            {{ t.detailedDescription }}
          </h2>

          <div
            class="prose prose-gray max-w-none"
            v-html="safeDescriptionHtml"
          />
        </section>
      </div>

      <div
        v-if="data"
        :class="whyPriceCardClass"
      >
        <h2 class="text-2xl font-bold mb-3">{{ t.whyPriceTitle }}</h2>
        <p class="text-gray-700 leading-relaxed">
          {{ t.whyPriceP1 }}
        </p>
        <p class="text-gray-700 leading-relaxed mt-4">
          {{ t.whyPriceP2 }}
        </p>
      </div>

    </div>
  </section>

</template>

<script setup lang="ts">
import { useIntlContext } from '#imports'
import DOMPurify from 'isomorphic-dompurify'
import { trackViewItem } from '~/services/analytics'

definePageMeta({ ssr: true })

const intl = useIntlContext()

const { siteName } = useSiteBranding()

const config = useRuntimeConfig()
const storeSlug = computed(() => String((config.public as any)?.storeSlug || '').trim())

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

const isCasaDoSoftware = computed(() => {
  if (normalizedHost.value.includes('casadosoftware.com.br')) return true
  return storeSlug.value === 'casadosoftware'
})

const isLicencasDigitais = computed(() => {
  if (normalizedHost.value.includes('licencasdigitais.com.br')) return true
  return storeSlug.value === 'licencasdigitais'
})

const sectionClass = computed(() => {
  return isLicencasDigitais.value ? 'bg-white min-h-screen' : 'bg-gray-100 min-h-screen py-12'
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
    : 'bg-white rounded-2xl shadow p-8 grid lg:grid-cols-2 gap-10'
})

const imageWrapClass = computed(() => {
  return isLicencasDigitais.value ? 'flex items-center justify-center bg-gray-50 border rounded-2xl p-6' : 'flex items-center justify-center'
})

const buyColumnClass = computed(() => {
  return isLicencasDigitais.value ? 'space-y-6 lg:pl-2' : 'space-y-6'
})

const buyButtonClass = computed(() => {
  return isLicencasDigitais.value
    ? 'w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-bold py-3.5 rounded-md transition'
    : 'w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 rounded-xl transition'
})

const tutorialCardClass = computed(() => {
  return isLicencasDigitais.value
    ? 'mt-10 border border-blue-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-blue-50'
    : 'mt-12 border border-blue-500 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-blue-50'
})

const descriptionCardClass = computed(() => {
  return isLicencasDigitais.value ? 'bg-white border rounded-2xl mt-10 p-6 md:p-8 space-y-10' : 'bg-white rounded-2xl shadow mt-12 p-8 space-y-10'
})

const whyPriceCardClass = computed(() => {
  return isLicencasDigitais.value ? 'bg-white border rounded-2xl mt-8 p-6 md:p-8' : 'bg-white rounded-2xl shadow mt-8 p-8'
})

const route = useRoute()
const slug = route.params.slug as string

const lang = computed(() => intl.language.value)

const isOffice365FiveLicenses = computed(() => {
  const s = String(slug || '').trim().toLowerCase()
  return s === 'microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive'
})

const baseUrl = useSiteUrl()

const canonicalUrl = computed(() => {
  const s = String(slug || '').trim()
  if (!s) return baseUrl ? `${baseUrl}/` : ''
  return baseUrl ? `${baseUrl}/produto/${s}` : ''
})

const { data, pending, error } = await useFetch(
  () => `/api/products/${slug}?lang=${encodeURIComponent(String(lang.value || 'pt'))}`,
  {
    server: true,
    watch: [lang],
    key: computed(() => `product:${String(slug || '')}:${String(lang.value || 'pt')}`)
  }
)

const safeProduct = computed(() => {
  const p = data.value

  if (!p) {
    return {
      nome: '',
      descricao: '',
      descricaoCurta: '',
      preco: 0,
      imagem: '/products/placeholder.png'
    }
  }

  const nome = (p as any).nome ?? (p as any).name ?? ''
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

const pageH1 = computed(() => {
  if (isCasaDoSoftware.value && isOffice365FiveLicenses.value) {
    return 'Licença Office 365 Original para PC e Mac – Entrega Instantânea'
  }
  return String(safeProduct.value.nome || '')
})

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
  const slugValue = String((safeProduct.value as any)?.slug || slug || '').trim().toLowerCase()
  if (isCasaDoSoftware.value) {
    if (slugValue.includes('windows-11') && slugValue.includes('pro')) {
      return 'Licença Windows 11 Pro Original – Ativação Imediata | Casa do Software'
    }
    if (slugValue.includes('windows-10') && slugValue.includes('pro')) {
      return 'Windows 10 Pro Original – Licença Digital Vitalícia | Casa do Software'
    }
    if (slugValue.includes('office') && (slugValue.includes('365') || slugValue.includes('microsoft-365'))) {
      if (isOffice365FiveLicenses.value) {
        return 'Licença Microsoft 365 Original PC e Mac | Entrega imediata'
      }

      return 'Office 365 Original – Licença Oficial com Entrega Imediata'
    }
    if (slugValue.includes('office') && slugValue.includes('2021')) {
      return 'Office 2021 Original – Chave de Ativação Vitalícia | Casa do Software'
    }
  }

  const name = String((safeProduct.value as any)?.nome || '').trim()
  const base = String(siteName || 'Casa do Software')
  return name ? `${name} | ${base}` : base
})

const seoDescription = computed(() => {
  const slugValue = String((safeProduct.value as any)?.slug || slug || '').trim().toLowerCase()
  if (isCasaDoSoftware.value) {
    if (slugValue.includes('windows-11') && slugValue.includes('pro')) {
      return 'Windows 11 Pro original com chave vitalícia e entrega na hora. Instale e ative em minutos com suporte completo. Compra segura!'
    }
    if (slugValue.includes('windows-10') && slugValue.includes('pro')) {
      return 'Compre Windows 10 Pro original com ativação instantânea e garantia. Licença vitalícia para PC ou notebook. Suporte incluso!'
    }
    if (slugValue.includes('office') && (slugValue.includes('365') || slugValue.includes('microsoft-365'))) {
      if (isOffice365FiveLicenses.value) {
        return 'Comprar licença do pacote Office permanente nunca foi tão fácil. Original, ativação rápida, conta oficial, suporte completo e envio imediato por email.'
      }

      return 'Microsoft Office 365 original para PC e Mac. Ativação rápida, conta oficial e suporte completo. Receba agora por e-mail!'
    }
    if (slugValue.includes('office') && slugValue.includes('2021')) {
      return 'Licença Office 2021 original com chave permanente e instalação simples. Entrega imediata e pagamento seguro. Ative em minutos!'
    }
  }

  const rawShort = String((safeProduct.value as any)?.descricaoCurta || '').trim()
  const rawLong = String((safeProduct.value as any)?.descricao || '').trim()

  const raw = rawShort || rawLong
  if (!raw) return ''

  const textOnly = DOMPurify.sanitize(raw, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, ' ')
    .trim()

  return textOnly.length > 155 ? textOnly.slice(0, 155) : textOnly
})

useHead(() => {
  const title = seoTitle.value
  const description = seoDescription.value
  const link = canonicalUrl.value ? [{ rel: 'canonical', href: canonicalUrl.value }] : []

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
  const priceCurrency = String(p?.currency || intl.currency.value || 'BRL')

  const jsonLd: any = {
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

  return {
    title,
    meta: [{ name: 'description', content: description }],
    link,
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(jsonLd)
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

  return DOMPurify.sanitize(normalized, {
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
    'Licença digital': 'Digital license',
    'Suporte 24/7': '24/7 support',
    'Suporte em horário comercial': 'Business hours support',
    '1 PC': '1 PC',
    'Compatível Windows 10 e 11': 'Compatible with Windows 10 and 11',
    'Ativação permanente': 'Permanent activation',
    'Sem renovação necessária': 'No renewal required',
    'Sem renovação': 'No renewal required'
  }

  const dictEs: Record<string, string> = {
    'Envio imediato após confirmação': 'Envío rápido tras la confirmación',
    'Envio rápido após confirmação': 'Envío rápido tras la confirmación',
    'Licença digital permanente': 'Licencia digital permanente',
    'Licença digital': 'Licencia digital',
    'Suporte 24/7': 'Soporte 24/7',
    'Suporte em horário comercial': 'Soporte en horario comercial',
    '1 PC': '1 PC',
    'Compatível Windows 10 e 11': 'Compatible con Windows 10 y 11',
    'Ativação permanente': 'Activación permanente',
    'Sem renovação necessária': 'Sin renovación',
    'Sem renovação': 'Sin renovación'
  }

  const dictIt: Record<string, string> = {
    'Envio imediato após confirmação': 'Consegna rapida dopo la conferma',
    'Envio rápido após confirmação': 'Consegna rapida dopo la conferma',
    'Licença digital permanente': 'Licenza digitale permanente',
    'Licença digital': 'Licenza digitale',
    'Suporte 24/7': 'Supporto 24/7',
    'Suporte em horário comercial': 'Supporto negli orari di ufficio',
    '1 PC': '1 PC',
    'Compatível Windows 10 e 11': 'Compatibile con Windows 10 e 11',
    'Ativação permanente': 'Attivazione permanente',
    'Sem renovação necessária': 'Nessun rinnovo necessario',
    'Sem renovação': 'Nessun rinnovo necessario'
  }

  const dictFr: Record<string, string> = {
    'Envio imediato após confirmação': 'Livraison rapide après confirmation',
    'Envio rápido após confirmação': 'Livraison rapide après confirmation',
    'Licença digital permanente': 'Licence numérique permanente',
    'Licença digital': 'Licence numérique',
    'Suporte 24/7': 'Support 24/7',
    'Suporte em horário comercial': 'Support pendant les heures ouvrées',
    '1 PC': '1 PC',
    'Compatível Windows 10 e 11': 'Compatible avec Windows 10 et 11',
    'Ativação permanente': 'Activation permanente',
    'Sem renovação necessária': 'Aucun renouvellement requis',
    'Sem renovação': 'Aucun renouvellement requis'
  }

  const lang = intl.language.value
  const dict = lang === 'en' ? dictEn : lang === 'es' ? dictEs : lang === 'it' ? dictIt : dictFr
  return items.map((it) => dict[it] || it)
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
      ms365Bullet1: 'Annual subscription (12 months), as described in the product.',
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
      ms365Bullet1: 'Suscripción anual (12 meses), según se describe en el producto.',
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
      ms365Bullet1: 'Abbonamento annuale (12 mesi), come descritto nel prodotto.',
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
      ms365Bullet1: 'Abonnement annuel (12 mois), comme décrit dans le produit.',
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
    whyPriceTitle: 'Por que nosso preço é mais acessível?',
    whyPriceP1: 'Nossos preços são mais acessíveis porque trabalhamos com distribuição digital, sem custos de mídia física, logística ou intermediários.',
    whyPriceP2: 'Isso nos permite oferecer valores competitivos, mantendo suporte e envio imediato após confirmação.',
    ms365HowTitle: 'Microsoft 365 / Office 365 — como funciona',
    ms365Bullet1: 'Assinatura anual (12 meses), conforme descrito no produto.',
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
