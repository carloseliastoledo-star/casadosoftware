<template>
  <section class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-6xl mx-auto px-6">

      <!-- Breadcrumb -->
      <div class="text-sm text-gray-500 mb-6">
        <NuxtLink to="/" class="hover:underline">Início</NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink to="/produtos" class="hover:underline">Produtos</NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700 font-medium">{{ safeProduct.nome }}</span>
      </div>

      <!-- Título -->
      <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">
        {{ safeProduct.nome }}
      </h1>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-20 text-gray-500">
        Carregando produto...
      </div>

      <!-- Erro -->
      <div v-else-if="error || !data" class="text-center py-20 text-red-600">
        Produto não encontrado.
      </div>

      <!-- Card principal -->
      <div
        v-else
        class="bg-white rounded-2xl shadow p-8 grid lg:grid-cols-2 gap-10"
      >

        <!-- Imagem -->
        <div class="flex items-center justify-center">
          <img
            :src="safeProduct.imagem"
            :alt="safeProduct.nome"
            class="w-full max-w-[520px] max-h-[520px] object-contain"
          />
        </div>

        <!-- Coluna compra -->
        <div class="space-y-6">
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

            <div class="text-sm text-blue-600">
              Pagamento à vista no PIX
              <span v-if="formattedPixPrice" class="text-gray-500">({{ formattedPixPrice }})</span>
            </div>
          </div>

          <div class="space-y-3">
            <button
              type="button"
              @click="buyNow"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 rounded-xl transition"
            >
              Comprar
            </button>
          </div>

          <div class="pt-2">
            <div class="text-lg font-semibold text-gray-900 mb-3">O que está incluído:</div>
            <ul class="space-y-2 text-gray-700">
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
        </div>
      </div>

      <!-- BLOCO AZUL TUTORIAL -->
      <div
        v-if="data && safeProduct.tutorialTitulo"
        class="mt-12 border border-blue-500 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-blue-50"
      >
        <div class="flex items-center gap-5">
          <div class="bg-blue-600 text-white p-4 rounded-xl text-xl">
            📘
          </div>

          <div>
            <h3 class="text-xl font-bold text-blue-700">
              {{ safeProduct.tutorialTitulo }}
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
          → Ver Tutorial
        </NuxtLink>
      </div>

      <!-- DESCRIÇÃO DETALHADA -->
      <div
        v-if="data"
        class="bg-white rounded-2xl shadow mt-12 p-8 space-y-10"
      >
        <details class="group md:hidden">
          <summary class="list-none cursor-pointer select-none flex items-center justify-between gap-4">
            <span class="text-2xl font-bold">Descrição Detalhada</span>
            <span class="text-gray-500 group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div class="mt-4">
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">
              {{ safeProduct.descricao }}
            </p>
          </div>
        </details>

        <section class="hidden md:block">
          <h2 class="text-2xl font-bold mb-3">
            Descrição Detalhada
          </h2>
          <p class="text-gray-700 leading-relaxed whitespace-pre-line">
            {{ safeProduct.descricao }}
          </p>
        </section>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

const route = useRoute()
const slug = route.params.slug as string

const { data, pending, error } = await useFetch(
  () => `/api/products/${slug}`,
  { server: false }
)

/**
 * Produto blindado + descrição longa automática
 */
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
    imagem: (p as any).image || (p as any).imagem || '/products/placeholder.png',
    slug: slugValue,
    precoAntigo: Number((p as any).precoAntigo ?? (p as any).old_price ?? 0) || null,
    tutorialTitulo: (p as any).tutorialTitle || (p as any).tutorialTitulo || null,
    tutorialSubtitulo: (p as any).tutorialSubtitle || (p as any).tutorialSubtitulo || 'Aprenda como ativar seu produto passo a passo com nosso guia completo e detalhado.',
    descricaoCurta,
    descricao: descricaoLonga
  }
})

const formattedPrice = computed(() => {
  return Number(safeProduct.value.preco || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const formattedOldPrice = computed(() => {
  const oldPrice = (safeProduct.value as any).precoAntigo
  if (!oldPrice || Number.isNaN(Number(oldPrice))) return null
  if (Number(oldPrice) <= Number(safeProduct.value.preco || 0)) return null
  return Number(oldPrice).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
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
  const price = Number(safeProduct.value.preco || 0)
  if (!price) return null
  const pixPrice = Math.round(price * 0.95 * 100) / 100
  if (pixPrice === price) return null
  return pixPrice.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const includedItems = [
  'Entrega instantânea',
  'Licença original e vitalícia',
  'Suporte 24/7',
  '1 PC',
  'Versão profissional com recursos avançados',
  'Compatível Windows 10 e 11',
  'Ativação permanente',
  'Sem renovação necessária'
]

function buyNow() {
  const slugValue = String((safeProduct.value as any)?.slug || slug || '')
  navigateTo({ path: '/checkout', query: { product: slugValue } })
}
</script>
