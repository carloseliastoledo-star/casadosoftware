<template>
  <section class="relative overflow-hidden bg-white">
    <div class="max-w-7xl mx-auto px-6 py-16 lg:py-20">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        <!-- Coluna esquerda: mensagem comercial -->
        <div class="space-y-6">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
            <span class="h-2 w-2 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
            Entrega imediata por e-mail
          </div>

          <!-- Título principal -->
          <h1 class="text-4xl md:text-5xl lg:text-[2.75rem] font-extrabold tracking-tight text-gray-900 leading-[1.15]">
            Licenças Originais Windows, Office e Autodesk
          </h1>

          <!-- Subtítulo -->
          <p class="text-gray-600 text-lg leading-relaxed max-w-lg">
            Compre com segurança, receba sua chave em minutos e ative com suporte e tutorial completo.
          </p>

          <!-- Botões CTAs -->
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <NuxtLink
              :to="productsIndexPath"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-8 py-4 text-base font-bold text-white transition shadow-md shadow-blue-200/60"
            >
              Ver produtos
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </NuxtLink>
            <NuxtLink
              to="/categoria/office"
              class="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white hover:border-blue-400 hover:text-blue-700 px-8 py-4 text-base font-semibold text-gray-700 transition"
            >
              Comprar Office
            </NuxtLink>
          </div>

          <!-- Micro benefícios -->
          <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 pt-2">
            <span class="flex items-center gap-2 font-medium">
              <span class="text-green-500 font-bold text-base">✓</span> Compra segura
            </span>
            <span class="flex items-center gap-2 font-medium">
              <span class="text-green-500 font-bold text-base">✓</span> Entrega imediata
            </span>
            <span class="flex items-center gap-2 font-medium">
              <span class="text-green-500 font-bold text-base">✓</span> Suporte rápido
            </span>
          </div>
        </div>

        <!-- Coluna direita: vitrine premium -->
        <div class="order-first lg:order-last">
          <div class="relative">
            <div class="absolute -inset-4 rounded-[2rem] bg-blue-600/3 blur-xl" aria-hidden="true" />
            <div class="relative bg-white rounded-[1.5rem] border border-gray-200 shadow-xl shadow-gray-200/50 p-6">
              <!-- Selo -->
              <div class="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 mb-5">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Produtos em destaque
              </div>

              <!-- Mini cards em grid -->
              <div class="grid grid-cols-1 gap-4">
                <MiniProductCard
                  v-for="product in featuredProducts"
                  :key="product.id"
                  :product="product"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import MiniProductCard from './MiniProductCard.vue'

const props = defineProps<{ productsIndexPath: string }>()

// Produtos em destaque para a vitrine (hardcoded por enquanto, pode ser dinâmico depois)
const featuredProducts = computed(() => [
  {
    id: '1',
    nome: 'Office 365 Original para PC e Mac',
    slug: 'office-365-original-pc-mac',
    imagem: null,
    descricao: 'Licença digital original para PC e Mac. Ativação online imediata.',
    preco: 49.90
  },
  {
    id: '2',
    nome: 'Windows 11 Pro – Licença Digital',
    slug: 'windows-11-pro-licenca-digital',
    imagem: null,
    descricao: 'Licença digital original. Ativação online em minutos.',
    preco: 89.90
  },
  {
    id: '3',
    nome: 'Autocad 2025 Para Windows (assinatura anual)',
    slug: 'autocad-2025-windows-anual',
    imagem: null,
    descricao: 'Assinatura anual. Licença oficial com suporte completo.',
    preco: 2499.90
  }
])
</script>
