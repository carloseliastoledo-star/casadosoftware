<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Página de Teste</h1>
    <p>Esta é uma página estática de teste.</p>
    <a href="/admin/atendimentos" class="text-blue-600">Voltar</a>
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  console.log('[atendimentos/teste] TEST PAGE Mounted')
})
</script>
