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
          <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">
            {{ categoria?.nome || 'Category' }}
          </h1>
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

      <div v-else-if="!categoria" class="text-center py-16 text-red-600">
        Category not found.
      </div>

      <div v-else class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ProductCard
          v-for="p in sortedProdutos"
          :key="p.id + (p.imagem || p.image || '')"
          :product="p"
        />
      </div>

      <IntlLanguageSwitcher
        v-if="categoria"
        page-type="category"
        :slug="String(categoria?.slug || '')"
        class="mt-6"
      />
    </div>
  </section>

  <section v-else class="bg-[#010d1a] min-h-screen">
    <!-- Header visual premium -->
    <CategoryHeaderPremium
      :category-name="String(categoria?.nome || 'Softwares').replace(/[\u00AD\u200B\u200C\u200D\u200E\u200F\u2028\u2029\u202A-\u202E\u2060\uFEFF]/g, '').normalize('NFC')"
      :product-count="produtos.length"
    />

    <!-- Conteúdo principal -->
    <div class="max-w-7xl mx-auto px-5 py-8">
      <div class="flex flex-col lg:flex-row gap-7 items-start">

        <!-- Sidebar -->
        <CategorySidebarPremium :current-slug="String(categoria?.slug || '')" />

        <!-- Área de grid -->
        <div class="flex-1 min-w-0">

          <!-- Loading state -->
          <div v-if="pending" class="flex items-center justify-center py-20 text-gray-400">
            <svg class="animate-spin w-6 h-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Carregando produtos...
          </div>

          <!-- Categoria não encontrada -->
          <div v-else-if="!categoria" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="text-4xl mb-4" aria-hidden="true">🔍</div>
            <h2 class="text-lg font-bold text-gray-800 mb-1">Categoria não encontrada</h2>
            <p class="text-sm text-gray-500 mb-5">Verifique o link ou volte para a página inicial.</p>
            <NuxtLink
              to="/"
              class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition"
            >
              Ir para o início
            </NuxtLink>
          </div>

          <!-- Grid vazio (categoria existe mas sem produtos) -->
          <div v-else-if="produtos.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="text-4xl mb-4" aria-hidden="true">📦</div>
            <h2 class="text-lg font-bold text-gray-800 mb-1">Nenhum produto encontrado</h2>
            <p class="text-sm text-gray-500">Esta categoria ainda não tem produtos cadastrados.</p>
          </div>

          <!-- Grid de produtos premium -->
          <CategoryGridPremium v-else>
            <ProductCard
              v-for="p in produtos"
              :key="p.id + (p.imagem || p.image || '')"
              :product="p"
            />
          </CategoryGridPremium>
        </div>
      </div>

      <!-- Language Switcher -->
      <IntlLanguageSwitcher
        v-if="categoria"
        page-type="category"
        :slug="String(categoria?.slug || '')"
        class="mt-10"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = String(route.params.slug || '')
  .trim()
  .toLowerCase()

const baseUrl = useSiteUrl()
const { siteName } = useSiteBranding()
const { canonicalUrl, hreflangLinks } = useSeoLocale({ pageType: 'category', slug })

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

const { data, pending } = await useFetch(() => `/api/categorias/${slug}`, {
  default: () => ({
    ok: false,
    categoria: null,
    produtos: []
  })
})

const categoria = computed(() => (data.value as any)?.categoria || null)

const produtos = computed(() =>
  Array.isArray((data.value as any)?.produtos)
    ? (data.value as any).produtos
    : []
)

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
    return list.sort(
      (a: any, b: any) =>
        Number(a?.price ?? a?.preco ?? 0) - Number(b?.price ?? b?.preco ?? 0)
    )
  }

  if (sort.value === 'price_desc') {
    return list.sort(
      (a: any, b: any) =>
        Number(b?.price ?? b?.preco ?? 0) - Number(a?.price ?? a?.preco ?? 0)
    )
  }

  return list
})

const pageTitle = computed(() => {
  const slugValue = String(categoria.value?.slug || slug || '').trim().toLowerCase()

  if (isCasaDoSoftware.value) {
    if (slugValue.includes('antiv')) {
      return 'Antivírus Original para PC – Licenças Oficiais com Desconto'
    }
    if (slugValue.includes('windows')) {
      return 'Licenças Windows Originais – Windows 10 e 11 Pro | Casa do Software'
    }
    if (slugValue.includes('office')) {
      return 'Microsoft Office Original – Licenças Oficiais e Vitalícias'
    }
  }

  return categoria.value?.nome
    ? `${categoria.value.nome} | ${siteName}`
    : `Categoria | ${siteName}`
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

  return String((categoria.value as any)?.descricao || '')
})

useSeoMeta({
  title: pageTitle,
  description: pageDescription
})

useHead(() => ({
  link: [
    ...(canonicalUrl.value ? [{ rel: 'canonical', href: canonicalUrl.value }] : []),
    ...(hreflangLinks.value as any[])
  ]
}))
</script>