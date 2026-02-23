<template>
  <section v-if="isLicencasDigitais" class="bg-white min-h-screen">
    <div class="max-w-7xl mx-auto px-6 pt-8 pb-12">
      <div class="text-xs text-gray-500">
        <NuxtLink to="/" class="hover:text-blue-600">Home</NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700">{{ categoria?.nome || 'Category' }}</span>
      </div>

      <div class="mt-3 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">{{ categoria?.nome || 'Category' }}</h1>
          <div class="mt-1 text-sm text-gray-600">
            {{ produtosCountText }}
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="text-xs font-semibold text-gray-600">Sort</div>
          <select
            v-model="sort"
            class="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800"
            aria-label="Sort"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div v-if="pending" class="text-center py-16 text-gray-500">
        Loading...
      </div>
      <div v-else-if="error" class="text-center py-16 text-red-600">
        Category not found.
      </div>

      <div v-else class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard
          v-for="p in sortedProdutos"
          :key="p.id + (p.imagem || p.image || '')"
          :product="p"
        />
      </div>
    </div>
  </section>

  <section v-else class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-7xl mx-auto px-6">
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900">{{ categoria?.nome || 'Categoria' }}</h1>
        <p class="text-sm text-gray-600 mt-1" v-if="categoria?.slug">/categoria/{{ categoria.slug }}/</p>
      </div>

      <div v-if="pending" class="text-center py-16 text-gray-500">
        Carregando...
      </div>
      <div v-else-if="error" class="text-center py-16 text-red-600">
        Categoria não encontrada.
      </div>

      <div v-else class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard
          v-for="p in produtos"
          :key="p.id + (p.imagem || p.image || '')"
          :product="p"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'

const route = useRoute()
const slug = String(route.params.slug || '')

const baseUrl = useSiteUrl()
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

    const headers = useRequestHeaders(['x-forwarded-host', 'x-original-host', 'host']) as Record<string, string | undefined>
    const raw = headers?.['x-forwarded-host'] || headers?.['x-original-host'] || headers?.host || ''
    const first = String(raw).split(',')[0]?.trim()
    return String(first || '').toLowerCase()
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

const { data, pending, error } = await useFetch(() => `/api/categorias/${slug}`, {
  server: true
})

const categoria = computed(() => (data.value as any)?.categoria || null)
const produtos = computed(() => (data.value as any)?.produtos || [])

const sort = ref<'featured' | 'newest' | 'price_asc' | 'price_desc'>('featured')

const produtosCountText = computed(() => {
  const n = Array.isArray(produtos.value) ? produtos.value.length : 0
  return `${n} item${n === 1 ? '' : 's'}`
})

const sortedProdutos = computed(() => {
  const list = Array.isArray(produtos.value) ? [...produtos.value] : []
  if (sort.value === 'newest') {
    return list.sort((a: any, b: any) => {
      const da = new Date(a?.createdAt || a?.criadoEm || 0).getTime()
      const db = new Date(b?.createdAt || b?.criadoEm || 0).getTime()
      return db - da
    })
  }

  if (sort.value === 'price_asc') {
    return list.sort((a: any, b: any) => Number(a?.price ?? a?.preco ?? 0) - Number(b?.price ?? b?.preco ?? 0))
  }

  if (sort.value === 'price_desc') {
    return list.sort((a: any, b: any) => Number(b?.price ?? b?.preco ?? 0) - Number(a?.price ?? a?.preco ?? 0))
  }

  return list
})

const canonicalUrl = computed(() => {
  const s = categoria.value?.slug || slug
  if (!s) return ''
  if (!baseUrl) return ''
  return `${baseUrl}/categoria/${s}`
})

const pageTitle = computed(() => {
  const slugValue = String(categoria.value?.slug || slug || '').trim().toLowerCase()
  if (isCasaDoSoftware.value) {
    if (slugValue.includes('antiv')) return 'Antivírus Original para PC – Licenças Oficiais com Desconto'
    if (slugValue.includes('windows')) return 'Licenças Windows Originais – Windows 10 e 11 Pro | Casa do Software'
    if (slugValue.includes('office')) return 'Microsoft Office Original – Licenças Oficiais e Vitalícias'
  }

  return categoria.value?.nome ? `${categoria.value.nome} | ${siteName}` : `Categoria | ${siteName}`
})

const pageDescription = computed(() => {
  const slugValue = String(categoria.value?.slug || slug || '').trim().toLowerCase()
  if (isCasaDoSoftware.value) {
    if (slugValue.includes('antiv')) {
      return 'Proteja seu computador com antivírus original e ativação imediata. Licenças oficiais com suporte e melhor preço do Brasil.'
    }
    if (slugValue.includes('windows')) {
      return 'Compre licenças Windows originais com ativação imediata e garantia vitalícia. Entrega rápida e suporte especializado.'
    }
    if (slugValue.includes('office')) {
      return 'Office 365, 2021 e versões oficiais com entrega imediata. Ative hoje mesmo com suporte e pagamento seguro.'
    }
  }

  return categoria.value?.descricao || ''
})

useSeoMeta({
  title: pageTitle,
  description: pageDescription
})

useHead(() => ({
  link: canonicalUrl.value
    ? [{ rel: 'canonical', href: canonicalUrl.value }]
    : []
}))
</script>
