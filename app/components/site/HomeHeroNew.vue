<template>
  <section class="relative overflow-hidden bg-gray-50">
    <div class="max-w-6xl mx-auto px-6 py-6 lg:py-8">
      <div class="grid lg:grid-cols-[55%_45%] gap-6 items-start">

        <!-- Coluna esquerda: conteúdo -->
        <div class="space-y-5">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold tracking-wide text-blue-700">
            <span class="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
            Entrega imediata
          </div>

          <!-- Título principal -->
          <h1 class="text-4xl md:text-5xl lg:text-[3.25rem] font-semibold tracking-tight text-slate-900 leading-[1.1]">
            Ative seus softwares em minutos
          </h1>

          <!-- Subtítulo -->
          <p class="text-slate-600 text-lg leading-relaxed max-w-md">
            Receba por e-mail e ative com suporte completo.
          </p>

          <!-- Botão principal -->
          <div class="pt-2">
            <NuxtLink
              :to="productsIndexPath"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 px-10 py-4 text-sm font-semibold text-white transition-all duration-200 shadow-md"
            >
              Ativar agora
            </NuxtLink>
          </div>

          <!-- Provas -->
          <div class="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-500 pt-1">
            <span class="flex items-center gap-2">
              <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Compra segura
            </span>
            <span class="flex items-center gap-2">
              <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Entrega imediata
            </span>
            <span class="flex items-center gap-2">
              <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Suporte técnico
            </span>
          </div>
        </div>

        <!-- Coluna direita: card premium -->
        <div class="order-first lg:order-last">
          <div class="relative sticky top-6">
            <div class="relative bg-white rounded-2xl border border-slate-200 shadow-md p-6">
              <!-- Imagem do produto -->
              <div class="relative h-72 bg-slate-50 rounded-xl mb-5 flex items-center justify-center overflow-hidden p-4">
                <img
                  src="/images/hero.webp"
                  alt="Office 365"
                  loading="eager"
                  decoding="async"
                  fetchpriority="high"
                  width="600"
                  height="600"
                  class="h-full w-full object-contain"
                />
              </div>

              <!-- Título do produto -->
              <h2 class="text-xl font-semibold text-slate-900 mb-1.5">
                Office 365
              </h2>

              <!-- Descrição -->
              <p class="text-slate-500 text-sm leading-relaxed mb-4">
                Para PC e Mac. Ativação rápida.
              </p>

              <!-- Preço -->
              <div class="mb-4">
                <div class="flex items-baseline gap-2 mb-1">
                  <span class="text-5xl font-bold text-slate-900">R$ 99</span>
                  <span class="text-xs text-slate-500">pagamento único</span>
                </div>
                <p class="text-xs text-slate-500">Receba em minutos no e-mail</p>
              </div>

              <!-- Botão -->
              <NuxtLink
                to="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive"
                class="block w-full text-center rounded-lg bg-slate-900 hover:bg-slate-800 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 shadow-md mb-3"
              >
                Ativar agora
              </NuxtLink>

              <!-- Micro copy -->
              <p class="text-center text-xs text-slate-500 mb-3">
                Receba sua chave em até 2 minutos no e-mail
              </p>

              <!-- Confiança -->
              <div class="flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg class="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Pagamento seguro</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
useHead({
  link: [
    { rel: 'preload', as: 'image', href: '/images/hero.webp', fetchpriority: 'high' }
  ]
})

const props = defineProps<{ productsIndexPath: string }>()</script>
