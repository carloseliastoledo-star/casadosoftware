<script setup lang="ts">
interface Props {
  customerName: string
  productName: string
  rating: number
  comment: string
  verified: boolean
  createdAt: string
}

const props = defineProps<Props>()

// Mascarar sobrenome do cliente
const maskedName = computed(() => {
  const parts = props.customerName.trim().split(' ')
  if (parts.length === 1) return parts[0]
  const firstName = parts[0]
  const lastInitial = parts[parts.length - 1]?.charAt(0) || ''
  return `${firstName} ${lastInitial}.`
})

// Formatar data
const formattedDate = computed(() => {
  const date = new Date(props.createdAt)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <div class="flex items-start justify-between mb-3">
      <div>
        <div class="font-semibold text-gray-900">{{ maskedName }}</div>
        <div class="text-sm text-gray-500">{{ productName }}</div>
      </div>
      <div v-if="verified" class="flex items-center gap-1 text-green-600 text-xs font-medium">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Cliente verificado
      </div>
    </div>

    <RatingStars :rating="rating" size="sm" class="mb-3" />

    <p class="text-gray-700 text-sm leading-relaxed">{{ comment }}</p>

    <div class="mt-4 text-xs text-gray-400">
      {{ formattedDate }}
    </div>
  </div>
</template>
