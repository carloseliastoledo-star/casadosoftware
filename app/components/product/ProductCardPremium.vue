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
    class="group relative flex flex-col overflow-hidden rounded-2xl border border-cyan-500/60 bg-[#07071a] hover:border-cyan-400 hover:shadow-[0_0_18px_2px_rgba(0,230,230,0.18)] transition-all duration-200"
  >
    <!-- Imagem -->
    <div class="relative w-full overflow-hidden bg-[#06061a] h-40">
      <img
        :src="productImage"
        :alt="productName"
        loading="lazy"
        decoding="async"
        width="400"
        height="160"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        referrerpolicy="no-referrer"
        @error="onImageError"
      />

      <!-- Badge desconto -->
      <div v-if="discountPercent" class="absolute top-2 right-2">
        <span class="inline-flex items-center rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-black text-white tracking-wider shadow">
          {{ discountPercent }}% OFF
        </span>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="flex flex-col flex-1 px-3 pt-2.5 pb-3">
      <!-- Nome -->
      <h3 class="font-semibold text-white text-xs leading-snug line-clamp-2 min-h-[2.25rem]">
        {{ productName }}
      </h3>

      <!-- Subtítulo LICENÇA DIGITAL -->
      <p class="mt-0.5 text-[10px] font-black tracking-widest uppercase text-cyan-400">
        LICENÇA DIGITAL
      </p>

      <!-- Bloco de preço -->
      <div class="mt-1.5 space-y-0.5">
        <div class="text-[1.35rem] font-black text-green-400 leading-none tracking-tight">
          {{ formattedPrice }}
        </div>
        <div v-if="formattedOldPrice" class="text-[11px] text-red-400 line-through leading-none">
          {{ formattedOldPrice }}
        </div>
      </div>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Botão -->
      <button
        type="button"
        class="mt-3 w-full rounded-lg border border-cyan-500 bg-[#0d0d2b] hover:bg-cyan-500/10 active:bg-cyan-500/20 text-white text-[11px] font-black uppercase tracking-widest py-2 transition-colors duration-150"
        @click="buyNow"
      >
        {{ buyNowLabel }}
      </button>
    </div>
  </NuxtLink>
</template>
