<script setup lang="ts">
import { computed } from 'vue'

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
    return '/products/placeholder.png'
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

function onImageError(e: Event) {
  const el = e.target as HTMLImageElement | null
  if (!el) return
  if (el.src.endsWith('/products/placeholder.png')) return
  el.src = '/products/placeholder.png'
}

const productName = computed(() => {
  return String((props.product as any)?.nome ?? (props.product as any)?.name ?? '')
})

const productPrice = computed(() => {
  return Number((props.product as any)?.preco ?? (props.product as any)?.price ?? 0)
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
  return productPrice.value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const formattedOldPrice = computed(() => {
  if (!productOldPrice.value) return null
  return productOldPrice.value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const formattedPixPrice = computed(() => {
  const price = productPrice.value
  if (!price) return null
  const pixPrice = Math.round(price * 0.95 * 100) / 100
  if (pixPrice === price) return null
  return pixPrice.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const categoryLabel = computed(() => {
  const n = productName.value.toLowerCase()
  if (n.includes('windows')) return 'WINDOWS'
  if (n.includes('office')) return 'OFFICE'
  return ''
})

const defaultIncludedItems = [
  'Entrega instantânea',
  'Licença original e vitalícia',
  'Suporte 24/7',
  '1 PC',
  'Versão profissional com recursos avançados',
  'Compatível Windows 10 e 11',
  'Ativação permanente',
  'Sem renovação necessária'
]

const includedItems = computed(() => {
  const raw = String((props.product as any)?.cardItems ?? '').trim()
  if (!raw) return defaultIncludedItems
  const items = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length ? items : defaultIncludedItems
})

function buyNow(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  navigateTo({ path: '/checkout', query: { product: props.product.slug } })
}
</script>

<template>
  <NuxtLink
    :to="`/produto/${product.slug}`"
    class="bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col overflow-hidden"
  >
    <!-- Imagem -->
    <div class="h-48 flex items-center justify-center bg-white">
      <img
        :src="productImage"
        :alt="productName"
        class="w-full h-[180px] object-contain"
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

        <div class="text-sm text-blue-600">
          Pagamento à vista no PIX
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
        @click="buyNow"
        class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
      >
        Comprar
      </button>
    </div>
  </NuxtLink>
</template>
