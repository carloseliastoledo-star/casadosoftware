<template>
  <div class="space-y-3">
    <div
      v-for="(item, idx) in items"
      :key="idx"
      class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <button
        type="button"
        class="flex w-full items-start justify-between gap-4 text-left"
        @click="toggle(idx)"
      >
        <div class="font-extrabold text-gray-900">{{ item.q }}</div>
        <div class="shrink-0 rounded-full border border-gray-200 p-1 text-gray-700">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path :d="openIndex === idx ? 'M6 12h12' : 'M12 6v12M6 12h12'" />
          </svg>
        </div>
      </button>
      <div v-if="openIndex === idx" class="mt-3 text-sm leading-relaxed text-gray-600">
        {{ item.a }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Item = { q: string; a: string }

defineProps<{ items: Item[] }>()

const openIndex = ref<number | null>(0)

function toggle(idx: number) {
  openIndex.value = openIndex.value === idx ? null : idx
}
</script>
