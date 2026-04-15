<template>
  <section class="relative overflow-hidden bg-white">
    <div class="max-w-7xl mx-auto px-6 py-16 lg:py-24">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        <!-- Coluna esquerda: conteúdo -->
        <div class="space-y-8">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
            <span class="h-2 w-2 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
            Entrega imediata por e-mail
          </div>

          <!-- Título principal -->
          <h1 class="text-4xl md:text-5xl lg:text-[3rem] font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Licenças Originais Windows, Office e Autodesk
          </h1>

          <!-- Subtítulo -->
          <p class="text-gray-600 text-lg leading-relaxed max-w-lg">
            Receba sua chave em minutos e ative com suporte e tutorial completo.
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

          <!-- Provas -->
          <div class="flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-600 pt-2">
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

        <!-- Coluna direita: único card premium -->
        <div class="order-first lg:order-last">
          <div class="relative">
            <div class="absolute -inset-6 rounded-[2.5rem] bg-blue-600/4 blur-2xl" aria-hidden="true" />
            <div class="relative bg-white rounded-[1.5rem] border border-gray-200 shadow-2xl shadow-gray-200/60 p-8">
              <!-- Imagem do produto -->
              <div class="relative h-48 bg-gradient-to-br from-blue-50 to-white rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/produto/office-365.jpg"
                  alt="Office 365"
                  loading="eager"
                  decoding="async"
                  class="h-40 w-auto object-contain"
                  referrerpolicy="no-referrer"
                />
              </div>

              <!-- Título do produto -->
              <h2 class="text-2xl font-extrabold text-gray-900 mb-3">
                Office 365 para PC e Mac
              </h2>

              <!-- Descrição -->
              <p class="text-gray-600 text-base leading-relaxed mb-6">
                Licença digital com ativação rápida e suporte completo.
              </p>

              <!-- Selos -->
              <div class="flex gap-3 mb-6">
                <span class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  Original
                </span>
                <span class="inline-flex items-center rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                  Entrega imediata
                </span>
              </div>

              <!-- Botão -->
              <NuxtLink
                to="/categoria/office"
                class="block w-full text-center rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-8 py-4 text-base font-bold text-white transition shadow-md shadow-blue-200/60"
              >
                Comprar agora
              </NuxtLink>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ productsIndexPath: string }>()
</script>
