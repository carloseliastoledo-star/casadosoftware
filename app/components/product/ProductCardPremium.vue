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

const categoryBg = computed(() => {
  const n = productName.value.toLowerCase()
  if (n.includes('office') || n.includes('365') || n.includes('microsoft 365')) return '#1a0a00'
  if (n.includes('windows server') || n.includes('server')) return '#1a0004'
  if (n.includes('windows')) return '#00091a'
  if (n.includes('project')) return '#001a06'
  if (n.includes('visio')) return '#0d001a'
  return '#061b33'
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
    class="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-[#021326] border border-cyan-500/30 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/90 hover:shadow-[0_0_36px_rgba(6,182,212,0.4)]"
  >
    <!-- Bloco de imagem: proporção fixa, overlay unificador -->
    <div
      class="relative w-full shrink-0 overflow-hidden"
      :style="`height:220px; background-color:${categoryBg}`"
    >
      <img
        :src="productImage"
        :alt="productName"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        referrerpolicy="no-referrer"
        @error="onImageError"
      />
      <!-- overlay: gradiente de baixo para cima para dar contraste e aspecto premium -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
      <!-- badge topo direito -->
      <div v-if="discountPercent" class="absolute top-2.5 right-2.5 z-10">
        <span class="inline-flex items-center rounded-full bg-red-600/90 px-2.5 py-0.5 text-[10px] font-black text-white tracking-widest">
          {{ discountPercent }}% OFF
        </span>
      </div>
    </div>

    <!-- Conteúdo centralizado -->
    <div class="flex flex-col flex-1 items-center text-center px-3 pt-3 pb-4">
      <!-- Título: 2 linhas max, altura uniforme -->
      <h3 class="text-[13px] font-bold text-white leading-snug line-clamp-2 min-h-[2.6rem] w-full">
        {{ productName }}
      </h3>

      <!-- Subtítulo -->
      <p class="mt-1.5 text-[9px] font-extrabold tracking-[0.22em] uppercase text-cyan-400">
        LICENÇA DIGITAL
      </p>

      <!-- Preço -->
      <div class="mt-2.5">
        <div class="text-[1.65rem] font-black text-[#00e676] leading-none">
          {{ formattedPrice }}
        </div>
        <div v-if="formattedOldPrice" class="mt-1 text-[11px] text-red-400/75 line-through leading-none">
          {{ formattedOldPrice }}
        </div>
      </div>

      <!-- Botão outline neon — mt-auto fixa na base -->
      <button
        type="button"
        class="mt-auto w-[92%] rounded-full border border-cyan-500/70 bg-transparent hover:bg-cyan-500/15 hover:border-cyan-400 text-white text-[10px] font-black uppercase tracking-[0.18em] py-2.5 transition-all duration-200"
        @click="buyNow"
      >
        {{ buyNowLabel }}
      </button>
    </div>
  </NuxtLink>
</template>
