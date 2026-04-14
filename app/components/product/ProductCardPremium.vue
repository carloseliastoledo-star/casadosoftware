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
    class="group relative flex flex-col rounded-2xl overflow-hidden bg-[#06091c] border border-blue-600/40 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/30"
  >
    <!-- Imagem -->
    <div class="relative w-full shrink-0 overflow-hidden" style="height:200px">
      <img
        :src="productImage"
        :alt="productName"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        referrerpolicy="no-referrer"
        @error="onImageError"
      />
      <!-- fade bottom para fundir com o card -->
      <div class="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#06091c] to-transparent" />
      <!-- Badge desconto -->
      <div v-if="discountPercent" class="absolute top-3 right-3 z-10">
        <span class="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-black text-white tracking-wider shadow-lg shadow-red-900/60">
          {{ discountPercent }}% OFF
        </span>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="flex flex-col flex-1 px-4 pt-3 pb-4 gap-1.5">
      <h3 class="text-sm font-bold text-white leading-snug line-clamp-2 min-h-[2.5rem]">
        {{ productName }}
      </h3>
      <p class="text-[10px] font-extrabold tracking-[0.18em] uppercase text-cyan-400">
        LICENÇA DIGITAL
      </p>
      <div class="mt-1.5">
        <div class="text-2xl font-black text-green-400 leading-none tracking-tight">
          {{ formattedPrice }}
        </div>
        <div v-if="formattedOldPrice" class="text-xs text-red-400/90 line-through mt-0.5 leading-none">
          {{ formattedOldPrice }}
        </div>
      </div>
      <button
        type="button"
        class="mt-auto pt-2.5 w-full rounded-full bg-blue-700 hover:bg-blue-500 active:bg-blue-800 text-white text-[11px] font-black uppercase tracking-[0.15em] py-3 transition-all duration-200 shadow-lg shadow-blue-900/50 hover:shadow-blue-500/40"
        @click="buyNow"
      >
        {{ buyNowLabel }}
      </button>
    </div>
  </NuxtLink>
</template>
