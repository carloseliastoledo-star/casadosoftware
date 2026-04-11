<template>
  <section class="bg-white border-t">
    <div class="max-w-7xl mx-auto px-6 py-14">
      <div class="grid lg:grid-cols-2 gap-12 items-start">

        <!-- Passos -->
        <div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">{{ $t('home.how_title') }}</h2>
          <p class="mt-3 text-gray-500 leading-relaxed">{{ $t('home.how_subtitle') }}</p>

          <div class="mt-8 space-y-6">
            <div v-for="(step, i) in steps" :key="i" class="flex gap-4">
              <div class="mt-0.5 flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shadow-blue-200">
                {{ i + 1 }}
              </div>
              <div>
                <div class="font-bold text-gray-900 leading-snug">{{ $t(step.titleKey) }}</div>
                <div class="mt-1 text-sm text-gray-500 leading-relaxed">{{ $t(step.bodyKey) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card de ajuda -->
        <div class="rounded-3xl bg-blue-50 border border-blue-100 p-8">
          <div class="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
            {{ $t('home.help_need_help') }}
          </div>
          <h3 class="text-xl font-extrabold text-gray-900 leading-snug">{{ $t('home.help_title') }}</h3>
          <p class="mt-3 text-gray-600 text-sm leading-relaxed">{{ $t('home.help_body') }}</p>

          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <NuxtLink
              :to="productsIndexPath"
              class="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-bold text-white transition"
            >
              {{ $t('buy_now') }}
            </NuxtLink>
            <NuxtLink
              to="/tutoriais"
              class="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white hover:border-blue-400 px-6 py-3 text-sm font-semibold text-blue-700 transition"
            >
              {{ $t('view_tutorials') }}
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ productsIndexPath: string }>()

const steps = [
  { titleKey: 'home.step1_title', bodyKey: 'home.step1_body' },
  { titleKey: 'home.step2_title', bodyKey: 'home.step2_body' },
  { titleKey: 'home.step3_title', bodyKey: 'home.step3_body' },
] as const
</script>
