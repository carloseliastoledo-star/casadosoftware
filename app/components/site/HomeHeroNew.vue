<template>
  <section class="relative overflow-hidden bg-gray-50">
    <div class="max-w-7xl mx-auto px-6 py-20 lg:py-28">
      <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        <!-- Coluna esquerda: conteúdo -->
        <div class="space-y-10">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium tracking-wide text-slate-600">
            Entrega imediata
          </div>

          <!-- Título principal -->
          <h1 class="text-4xl md:text-5xl lg:text-[2.75rem] font-semibold tracking-tight text-slate-900 leading-[1.15]">
            Ative seus softwares em minutos
          </h1>

          <!-- Subtítulo -->
          <p class="text-slate-600 text-lg leading-relaxed max-w-md">
            Receba por e-mail e ative com suporte completo.
          </p>

          <!-- Botões CTAs -->
          <div class="flex flex-col sm:flex-row gap-4 pt-4">
            <NuxtLink
              :to="productsIndexPath"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 shadow-sm"
            >
              Ativar agora
            </NuxtLink>
            <NuxtLink
              to="/categoria/office"
              class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white hover:border-slate-400 px-8 py-3.5 text-sm font-medium text-slate-700 transition-all duration-200"
            >
              Office 365
            </NuxtLink>
          </div>

          <!-- Provas -->
          <div class="flex flex-wrap gap-x-10 gap-y-3 text-sm text-slate-500 pt-2">
            <span class="flex items-center gap-2">
              <span class="text-slate-900">·</span> Compra segura
            </span>
            <span class="flex items-center gap-2">
              <span class="text-slate-900">·</span> Entrega imediata
            </span>
            <span class="flex items-center gap-2">
              <span class="text-slate-900">·</span> Suporte técnico
            </span>
          </div>
        </div>

        <!-- Coluna direita: único card premium -->
        <div class="order-first lg:order-last">
          <div class="relative">
            <div class="absolute -inset-6 rounded-[2rem] bg-slate-200/40 blur-3xl" aria-hidden="true" />
            <div class="relative bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-12">
              <!-- Imagem do produto -->
              <div class="relative h-80 bg-gradient-to-br from-slate-50 to-white rounded-xl mb-8 flex items-center justify-center overflow-hidden p-6">
                <img
                  src="https://pub-388810139d004c3eb59d2d54c6e92aa7.r2.dev/uploads/1776154645975-container-capa-home-365-premiium-300x300-processed.png"
                  alt="Office 365"
                  loading="eager"
                  decoding="async"
                  class="h-full w-full object-contain"
                  referrerpolicy="no-referrer"
                />
              </div>

              <!-- Título do produto -->
              <h2 class="text-xl font-medium text-slate-900 mb-2">
                Office 365
              </h2>

              <!-- Descrição -->
              <p class="text-slate-500 text-sm leading-relaxed mb-8">
                Para PC e Mac. Ativação rápida.
              </p>

              <!-- Preço -->
              <div class="mb-8">
                <div class="flex items-baseline gap-2">
                  <span class="text-4xl font-semibold text-slate-900">R$ 49</span>
                  <span class="text-xs text-slate-500">pagamento único</span>
                </div>
              </div>

              <!-- Botão -->
              <NuxtLink
                to="/categoria/office"
                class="block w-full text-center rounded-lg bg-slate-900 hover:bg-slate-800 px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 shadow-sm mb-6"
              >
                Comprar agora
              </NuxtLink>

              <!-- Confiança -->
              <div class="flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
const props = defineProps<{ productsIndexPath: string }>()</script>
