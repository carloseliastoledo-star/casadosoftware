<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Detalhes do Atendimento</h1>
    <p>ID: {{ conversationId }}</p>
    <a href="/admin/atendimentos" class="text-blue-600">Voltar</a>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const conversationId = computed(() => String(route.params.id))

onMounted(() => {
  console.log('[atendimentos/[id]] SIMPLE PAGE NO LAYOUT Mounted with ID:', conversationId.value)
})
</script>
