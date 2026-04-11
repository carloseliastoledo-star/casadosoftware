<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale: _i18nLocale } = useI18n()

const effectiveLang = computed<'pt' | 'en' | 'es' | 'fr' | 'it'>(() => {
  const l = String(_i18nLocale.value || '').toLowerCase()
  return (l === 'en' || l === 'es' || l === 'fr' || l === 'it') ? (l as any) : 'pt'
})

interface Product {
  id: number
  name?: string
  nome?: string
  slug: string
  price?: number
  preco?: number
  old_price?: number | null
  precoAntigo?: number | null
  image?: string | null
  imagem?: string | null
  cardItems?: string | null
}

const props = defineProps<{
  product: Product
}>()

const productImage = computed(() => {
  const image = (props.product as any)?.image ?? (props.product as any)?.imagem
  if (!image) return '/products/placeholder.svg'
  if (image.startsWith('http://')) return image.replace(/^http:\/\//, 'https://')
  if (image.startsWith('http')) return image
  if (image.startsWith('/')) return image
  const cleanImage = image
    .replace(/^\/+/, '')
    .replace(/^products\//, '')
    .replace(/^public\//, '')
  return `/${cleanImage}`
})

const productPath = computed(() => {
  const s = String((props.product as any)?.slug || '').trim()
  if (!s) return '/'
  const lang = effectiveLang.value
  const segment = lang === 'en' ? 'product' : lang === 'es' ? 'producto' : 'produto'
  return `/${segment}/${s}`
})

function onImageError(e: Event) {
  const el = e.target as HTMLImageElement | null
  if (!el) return
  if (el.src.endsWith('/products/placeholder.svg')) return
  el.src = '/products/placeholder.svg'
}

const productName = computed(() => {
  const nomeRaw = String((props.product as any)?.nome ?? '')
  const nameRaw = String((props.product as any)?.name ?? '')
  const v = effectiveLang.value === 'pt' ? nomeRaw || nameRaw : nameRaw || nomeRaw
  return String(v || '')
})

const productPrice = computed(() => {
  return Number((props.product as any)?.preco ?? (props.product as any)?.price ?? 0)
})

const productCurrencyLower = computed(() => {
  const c = String((props.product as any)?.currency || '').trim().toLowerCase()
  if (c === 'usd' || c === 'eur' || c === 'brl') return c
  return effectiveLang.value === 'pt' ? 'brl' : 'usd'
})

const currencyUpper = computed(() => {
  if (productCurrencyLower.value === 'usd') return 'USD'
  if (productCurrencyLower.value === 'eur') return 'EUR'
  return 'BRL'
})

const locale = computed(() => {
  if (effectiveLang.value === 'pt') return 'pt-BR'
  if (effectiveLang.value === 'en') return 'en-US'
  if (effectiveLang.value === 'es') return 'es-ES'
  if (effectiveLang.value === 'it') return 'it-IT'
  if (effectiveLang.value === 'fr') return 'fr-FR'
  return 'pt-BR'
})

const isBrl = computed(() => productCurrencyLower.value === 'brl')

const productOldPrice = computed(() => {
  const oldPrice = (props.product as any)?.precoAntigo ?? (props.product as any)?.old_price
  const n = oldPrice == null ? 0 : Number(oldPrice)
  if (!n || Number.isNaN(n)) return null
  if (n <= productPrice.value) return null
  return n
})

const discountPercent = computed(() => {
  if (!productOldPrice.value) return null
  const current = productPrice.value
  const old = productOldPrice.value
  if (!current || !old) return null
  return Math.round((1 - current / old) * 100)
})

const formattedPrice = computed(() => {
  if (import.meta.client) {
    return productPrice.value.toLocaleString(locale.value, {
      style: 'currency',
      currency: currencyUpper.value
    })
  }
  return productPrice.value || 0
})

const formattedOldPrice = computed(() => {
  if (!productOldPrice.value) return null
  if (import.meta.client) {
    return productOldPrice.value.toLocaleString(locale.value, {
      style: 'currency',
      currency: currencyUpper.value
    })
  }
  return productOldPrice.value || 0
})

const buyNowLabel = computed(() => {
  if (effectiveLang.value === 'en') return 'Buy now'
  if (effectiveLang.value === 'es') return 'Comprar ahora'
  if (effectiveLang.value === 'it') return 'Acquista ora'
  if (effectiveLang.value === 'fr') return 'Acheter maintenant'
  return 'Comprar agora'
})

const microCopy = computed(() => {
  if (effectiveLang.value === 'en') return 'Digital delivery  •  Fast activation  •  Secure'
  return 'Entrega digital  •  Ativação rápida  •  Compra segura'
})

const installmentsLabel = computed(() => {
  if (effectiveLang.value === 'en') return 'or up to 12x on card'
  return 'ou em até 12x no cartão'
})

function buyNow(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  navigateTo({ path: '/checkout', query: { product: props.product.slug } })
}
</script>

<template>
  <NuxtLink
    :to="productPath"
    class="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
  >
    <!-- Imagem -->
    <div class="relative bg-slate-50 flex items-center justify-center overflow-hidden" style="aspect-ratio:4/3">
      <img
        :src="productImage"
        :alt="productName"
        loading="lazy"
        decoding="async"
        width="320"
        height="240"
        class="w-full h-full object-contain p-5 transition-transform duration-300 group-hover:scale-[1.04]"
        referrerpolicy="no-referrer"
        @error="onImageError"
      />

      <!-- Selo Licença Digital -->
      <div class="absolute top-2.5 left-2.5">
        <span class="inline-flex items-center rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white tracking-wider uppercase shadow-sm">
          Licença Digital
        </span>
      </div>

      <!-- Badge de desconto -->
      <div v-if="discountPercent" class="absolute top-2.5 right-2.5">
        <span class="inline-flex items-center rounded-md bg-green-500 px-2 py-0.5 text-[10px] font-black text-white tracking-wider shadow-sm">
          {{ discountPercent }}% OFF
        </span>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="flex flex-col flex-1 p-4">
      <!-- Nome do produto -->
      <h3 class="font-bold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.75rem]">
        {{ productName }}
      </h3>

      <!-- Bloco de preço -->
      <div class="mt-3 space-y-0.5">
        <div v-if="formattedOldPrice" class="text-xs text-gray-400 line-through leading-none">
          {{ formattedOldPrice }}
        </div>
        <div class="text-[1.65rem] font-black text-green-600 leading-none tracking-tight">
          {{ formattedPrice }}
        </div>
        <div v-if="isBrl" class="text-[11px] text-gray-400 leading-none pt-0.5">
          {{ installmentsLabel }}
        </div>
      </div>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Botão CTA -->
      <div class="mt-4 space-y-1.5">
        <button
          type="button"
          class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm shadow-blue-200/60"
          @click="buyNow"
        >
          {{ buyNowLabel }}
        </button>
        <!-- Microcopy -->
        <p class="text-[10px] text-gray-400 text-center leading-tight">{{ microCopy }}</p>
      </div>
    </div>
  </NuxtLink>
</template>
