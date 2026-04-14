<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// useI18n() uses Vue's provide/inject — works in ALL child components across async
// boundaries regardless of experimental.asyncContext, unlike useNuxtApp()-based composables.
// The i18n plugin (i18n.ts) correctly sets locale='en' for .store domain.
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

  if (!image) {
    return '/products/placeholder.svg'
  }

  if (image.startsWith('http://')) {
    return image.replace(/^http:\/\//, 'https://')
  }

  if (image.startsWith('http')) {
    return image
  }

  if (image.startsWith('/')) {
    return image
  }

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

  const segment =
    lang === 'en' ? 'product' :
    lang === 'es' ? 'producto' :
    'produto'

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

const installmentsLabel = computed(() => {
  if (effectiveLang.value === 'en') return 'up to 12x of'
  if (effectiveLang.value === 'es') return 'hasta 12x de'
  if (effectiveLang.value === 'it') return 'fino a 12x da'
  if (effectiveLang.value === 'fr') return "jusqu'à 12x de"
  return 'em até 12x de'
})

const pixLabel = computed(() => {
  if (effectiveLang.value === 'en') return 'PIX upfront payment'
  if (effectiveLang.value === 'es') return 'Pago al contado con PIX'
  if (effectiveLang.value === 'it') return 'Pagamento in contanti con PIX'
  if (effectiveLang.value === 'fr') return 'Paiement comptant avec PIX'
  return 'Pagamento à vista no PIX'
})

const buyNowLabel = computed(() => {
  if (effectiveLang.value === 'en') return 'Buy now'
  if (effectiveLang.value === 'es') return 'Comprar ahora'
  if (effectiveLang.value === 'it') return 'Acquista ora'
  if (effectiveLang.value === 'fr') return 'Acheter maintenant'
  return 'Comprar agora'
})

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

const formattedPixPrice = computed(() => {
  if (!isBrl.value) return null
  const price = productPrice.value
  if (!price) return null
  const pixPrice = Math.round(price * 0.95 * 100) / 100
  if (pixPrice === price) return null
  if (import.meta.client) {
    return pixPrice.toLocaleString(locale.value, {
      style: 'currency',
      currency: currencyUpper.value
    })
  }
  return pixPrice || 0
})

const installments12 = computed(() => {
  if (!isBrl.value) return null
  const price = productPrice.value
  if (!price) return null
  const value = Math.round((price / 12) * 100) / 100
  if (!value) return null
  return value.toLocaleString(locale.value, {
    style: 'currency',
    currency: currencyUpper.value
  })
})

const categoryLabel = computed(() => {
  const n = productName.value.toLowerCase()
  if (n.includes('windows')) return 'WINDOWS'
  if (n.includes('office')) return 'OFFICE'
  return ''
})

const defaultIncludedItems = computed(() => {
  if (effectiveLang.value === 'en') {
    return [
      'Fast delivery after confirmation',
      'Permanent digital license',
      '24/7 support',
      '1 PC',
      'Professional version with advanced features',
      'Compatible with Windows 10 and 11',
      'Permanent activation',
      'No renewal required'
    ]
  }

  if (effectiveLang.value === 'es') {
    return [
      'Envío rápido tras la confirmación',
      'Licencia digital permanente',
      'Soporte 24/7',
      '1 PC',
      'Versión profesional con funciones avanzadas',
      'Compatible con Windows 10 y 11',
      'Activación permanente',
      'Sin renovación'
    ]
  }

  if (effectiveLang.value === 'it') {
    return [
      'Consegna rapida dopo la conferma',
      'Licenza digitale permanente',
      'Supporto 24/7',
      '1 PC',
      'Versione professionale con funzionalità avanzate',
      'Compatibile con Windows 10 e 11',
      'Attivazione permanente',
      'Nessun rinnovo necessario'
    ]
  }

  if (effectiveLang.value === 'fr') {
    return [
      'Livraison rapide après confirmation',
      'Licence numérique permanente',
      'Support 24/7',
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
    'Suporte 24/7',
    '1 PC',
    'Versão profissional com recursos avançados',
    'Compatível Windows 10 e 11',
    'Ativação permanente',
    'Sem renovação necessária'
  ]
})

const includedItems = computed(() => {
  const raw = String((props.product as any)?.cardItems ?? '').trim()
  if (!raw) return defaultIncludedItems.value
  const items = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (!items.length) return defaultIncludedItems.value

  if (effectiveLang.value === 'pt') return items

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
    'Suporte em horário comercial': "Support pendant les heures ouvrées",
    '1 PC': '1 PC',
    'Compatível Windows 10 e 11': 'Compatible avec Windows 10 et 11',
    'Ativação permanente': 'Activation permanente',
    'Sem renovação necessária': 'Aucun renouvellement requis',
    'Sem renovação': 'Aucun renouvellement requis'
  }

  const lang = effectiveLang.value
  const dict = lang === 'en' ? dictEn : lang === 'es' ? dictEs : lang === 'it' ? dictIt : dictFr

  function looksLikePt(s: string): boolean {
    return /[ãçõ]|após|contratado|vitalí|mensalidade|imediato|horário|comercial|ativação|atualiz|instala|gratuita|simples|contínuo/i.test(s)
  }

  return items
    .map((it) => dict[it] ?? (looksLikePt(it) ? '' : it))
    .filter(Boolean)
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
    class="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-[#06091c] border border-blue-600/40 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/30"
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
