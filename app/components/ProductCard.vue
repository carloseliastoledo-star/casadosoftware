<script setup lang="ts">
import { computed } from 'vue'

const intl = useIntlContext()

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

  const lang = intl.language.value

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
  const v = intl.language.value === 'pt' ? nomeRaw || nameRaw : nameRaw || nomeRaw
  return String(v || '')
})

const productPrice = computed(() => {
  return Number((props.product as any)?.preco ?? (props.product as any)?.price ?? 0)
})

const productCurrencyLower = computed(() => {
  const c = String((props.product as any)?.currency || '').trim().toLowerCase()
  if (c === 'usd' || c === 'eur' || c === 'brl') return c
  return intl.currencyLower.value
})

const currencyUpper = computed(() => {
  if (productCurrencyLower.value === 'usd') return 'USD'
  if (productCurrencyLower.value === 'eur') return 'EUR'
  return 'BRL'
})

const locale = computed(() => intl.locale.value)

const isBrl = computed(() => productCurrencyLower.value === 'brl')

const installmentsLabel = computed(() => {
  if (intl.language.value === 'en') return 'up to 12x of'
  if (intl.language.value === 'es') return 'hasta 12x de'
  if (intl.language.value === 'it') return 'fino a 12x da'
  if (intl.language.value === 'fr') return "jusqu'à 12x de"
  return 'em até 12x de'
})

const pixLabel = computed(() => {
  if (intl.language.value === 'en') return 'PIX upfront payment'
  if (intl.language.value === 'es') return 'Pago al contado con PIX'
  if (intl.language.value === 'it') return 'Pagamento in contanti con PIX'
  if (intl.language.value === 'fr') return 'Paiement comptant avec PIX'
  return 'Pagamento à vista no PIX'
})

const buyNowLabel = computed(() => {
  if (intl.language.value === 'en') return 'Buy now'
  if (intl.language.value === 'es') return 'Comprar ahora'
  if (intl.language.value === 'it') return 'Acquista ora'
  if (intl.language.value === 'fr') return 'Acheter maintenant'
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
  if (intl.language.value === 'en') {
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

  if (intl.language.value === 'es') {
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

  if (intl.language.value === 'it') {
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

  if (intl.language.value === 'fr') {
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

  const lang = intl.language.value
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
    class="bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col overflow-hidden"
  >
    <!-- Imagem -->
    <div class="h-48 flex items-center justify-center bg-white">
      <img
        :src="productImage"
        :alt="productName"
        loading="lazy"
        decoding="async"
        width="520"
        height="180"
        class="w-full h-[180px] object-contain"
        referrerpolicy="no-referrer"
        @error="onImageError"
      />
    </div>

    <div class="p-5 flex flex-col flex-1">
      <div v-if="categoryLabel" class="text-xs tracking-widest text-gray-400 text-center">
        {{ categoryLabel }}
      </div>

      <h3 class="mt-2 font-semibold text-gray-900 text-center text-lg">
        {{ productName }}
      </h3>

      <div class="mt-4 text-center space-y-2">
        <div class="flex items-center justify-center gap-2">
          <div v-if="formattedOldPrice" class="text-sm text-gray-400 line-through">
            {{ formattedOldPrice }}
          </div>

          <span
            v-if="discountPercent"
            class="inline-flex items-center rounded-full bg-green-100 text-green-700 text-xs font-semibold px-3 py-1"
          >
            {{ discountPercent }}% OFF
          </span>
        </div>

        <div class="text-3xl font-extrabold text-gray-900">
          {{ formattedPrice }}
        </div>

        <div v-if="installments12" class="text-sm text-gray-600">
          {{ installmentsLabel }} {{ installments12 }}
        </div>

        <div v-if="isBrl" class="text-sm text-blue-600">
          {{ pixLabel }}
          <span v-if="formattedPixPrice" class="text-gray-500">({{ formattedPixPrice }})</span>
        </div>
      </div>

      <ul class="mt-5 space-y-2 text-gray-700">
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

      <button
        type="button"
        @click="buyNow"
        class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
      >
        {{ buyNowLabel }}
      </button>
    </div>
  </NuxtLink>
</template>
