<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const loading = ref(false)

async function exportarCSV() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/produtos/export', {
      responseType: 'text'
    })

    // Criar blob e download
    const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `produtos-export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    alert('Exportação concluída! Verifique seu download.')
  } catch (err: any) {
    alert('Erro ao exportar: ' + (err?.message || 'Erro desconhecido'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Exportar Produtos</h1>
      <p class="text-gray-600 mt-2">
        Exporte todos os produtos (ativos e inativos) para um arquivo CSV.
        Use este arquivo para importar em outra loja.
      </p>
    </div>

    <div class="bg-white rounded-lg shadow p-6 max-w-2xl">
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-3">O que será exportado:</h2>
        <ul class="list-disc list-inside text-gray-700 space-y-1">
          <li>Nome e slug do produto</li>
          <li>Descrição completa e resumida</li>
          <li>Preço atual e preço de comparação</li>
          <li>Imagem principal</li>
          <li>Categorias (separadas por |)</li>
          <li>Status (ativo/inativo)</li>
          <li>Configurações de SEO</li>
          <li>Itens do card e tutorial</li>
          <li>Labels de conversão Google Ads</li>
        </ul>
      </div>

      <div class="mb-6 p-4 bg-blue-50 rounded-lg">
        <p class="text-sm text-blue-800">
          <strong>Dica:</strong> O arquivo CSV gerado pode ser importado em qualquer loja que use o mesmo sistema.
          As categorias serão criadas automaticamente durante a importação.
        </p>
      </div>

      <button
        type="button"
        class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        :disabled="loading"
        @click="exportarCSV"
      >
        <span v-if="loading">Exportando...</span>
        <span v-else>📥 Exportar para CSV</span>
      </button>
    </div>

    <div class="mt-6">
      <NuxtLink
        to="/admin/produtos/importar"
        class="text-blue-600 hover:underline"
      >
        Ir para Importação de Produtos →
      </NuxtLink>
    </div>
  </div>
</template>
