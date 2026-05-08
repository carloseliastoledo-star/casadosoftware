<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Detalhes do Atendimento</h1>
    <p>ID: {{ conversationId }}</p>
    <a href="/admin/atendimentos" class="text-blue-600">Voltar</a>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const conversationId = computed(() => String(route.params.id))

onMounted(() => {
  console.log('[atendimentos/[id]] SIMPLE PAGE Mounted with ID:', conversationId.value)
})
</script>
