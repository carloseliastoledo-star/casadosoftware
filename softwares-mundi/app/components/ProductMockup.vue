<template>
  <div class="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-b from-blue-50 to-white p-4">
    <div class="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-100 blur-2xl" />
    <div class="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-green-100 blur-2xl" />

    <div class="relative flex items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-gray-700 shadow-sm">
          <span class="inline-flex h-2 w-2 rounded-full" :class="dotClass" />
          <span>Genuine License</span>
        </div>
        <div class="mt-3 text-sm font-extrabold text-gray-900">{{ label }}</div>
        <div class="mt-1 text-xs font-semibold text-gray-600">Instant Delivery</div>
      </div>

      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="label"
        class="h-16 w-24 shrink-0 rounded-xl border border-white/60 bg-white object-contain p-2"
        loading="lazy"
      />
      <svg v-else viewBox="0 0 120 90" class="h-16 w-24 shrink-0">
        <rect x="8" y="10" width="92" height="62" rx="10" :fill="accentFill" />
        <rect x="18" y="20" width="72" height="8" rx="4" fill="rgba(255,255,255,0.85)" />
        <rect x="18" y="34" width="50" height="6" rx="3" fill="rgba(255,255,255,0.8)" />
        <rect x="18" y="46" width="60" height="6" rx="3" fill="rgba(255,255,255,0.8)" />
        <rect x="18" y="58" width="40" height="6" rx="3" fill="rgba(255,255,255,0.8)" />
        <circle cx="104" cy="56" r="14" :fill="badgeFill" />
        <path d="M98 56l4 4 8-10" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductImageVariant } from '~/data/catalog'

const props = defineProps<{ variant?: ProductImageVariant; imageUrl?: string }>()

const variant = computed<ProductImageVariant>(() => props.variant || 'generic')

const label = computed(() => {
  if (variant.value === 'office') return 'Office'
  if (variant.value === 'windows') return 'Windows'
  if (variant.value === 'adobe') return 'Adobe'
  if (variant.value === 'security') return 'Security'
  if (variant.value === 'utility') return 'Utilities'
  return 'Software'
})

const accentFill = computed(() => {
  if (variant.value === 'adobe') return '#ef4444'
  if (variant.value === 'security') return '#111827'
  if (variant.value === 'windows') return '#2563eb'
  if (variant.value === 'utility') return '#6b7280'
  if (variant.value === 'office') return '#1d4ed8'
  return '#1d4ed8'
})

const badgeFill = computed(() => {
  if (variant.value === 'security') return '#16a34a'
  return '#16a34a'
})

const dotClass = computed(() => {
  if (variant.value === 'adobe') return 'bg-red-500'
  if (variant.value === 'security') return 'bg-green-600'
  if (variant.value === 'windows') return 'bg-blue-600'
  if (variant.value === 'utility') return 'bg-gray-500'
  return 'bg-blue-600'
})

const imageUrl = computed(() => String(props.imageUrl || '').trim())
</script>
