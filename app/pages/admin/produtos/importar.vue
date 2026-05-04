<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const fileInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const loading = ref(false)
const result = ref<{
  ok?: boolean
  created?: number
  updated?: number
  categoriesCreated?: number
  totalProcessed?: number
  errors?: string[]
} | null>(null)

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    file.value = target.files[0]
    result.value = null
  }
}

async function importarCSV() {
  if (!file.value) {
    alert('Selecione um arquivo CSV primeiro')
    return
  }

  if (!file.value.name.endsWith('.csv')) {
    alert('O arquivo deve ser um CSV (.csv)')
    return
  }

  loading.value = true
  result.value = null

  try {
    const formData = new FormData()
    formData.append('file', file.value)

    const response = await $fetch('/api/admin/produtos/import', {
      method: 'POST',
      body: formData
    })

    result.value = response as any

    if (response.ok) {
      alert(`Importação concluída! ${response.created} criados, ${response.updated} atualizados.`)
    }
  } catch (err: any) {
    alert('Erro ao importar: ' + (err?.data?.statusMessage || err?.message || 'Erro desconhecido'))
  } finally {
    loading.value = false
  }
}

function clearFile() {
  file.value = null
  result.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Importar Produtos</h1>
      <p class="text-gray-600 mt-2">
        Importe produtos de um arquivo CSV exportado de outra loja.
        Produtos com o mesmo slug serão atualizados automaticamente.
      </p>
    </div>

    <div class="bg-white rounded-lg shadow p-6 max-w-2xl">
      <!-- Upload -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Arquivo CSV
        </label>
        <input
          ref="fileInput"
          type="file"
          accept=".csv"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          @change="onFileChange"
        />
        <p v-if="file" class="mt-2 text-sm text-gray-600">
          Arquivo selecionado: <strong>{{ file.name }}</strong> ({{ (file.size / 1024).toFixed(2) }} KB)
          <button
            type="button"
            class="ml-2 text-red-600 hover:underline text-xs"
            @click="clearFile"
          >
            Remover
          </button>
        </p>
      </div>

      <!-- Instruções -->
      <div class="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h3 class="font-medium text-yellow-800 mb-2">Regras de Importação:</h3>
        <ul class="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Produtos são identificados pelo <strong>slug</strong></li>
          <li>Se o slug existir: produto será <strong>atualizado</strong></li>
          <li>Se o slug não existir: produto será <strong>criado</strong></li>
          <li>Categorias serão criadas automaticamente se não existirem</li>
          <li>Produtos existentes que não estão no CSV <strong>não serão apagados</strong></li>
        </ul>
      </div>

      <!-- Botão Importar -->
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
          :disabled="!file || loading"
          @click="importarCSV"
        >
          <span v-if="loading">Importando...</span>
          <span v-else>📤 Importar CSV</span>
        </button>

        <NuxtLink
          to="/admin/produtos/exportar"
          class="text-gray-600 hover:underline"
        >
          ← Voltar para Exportação
        </NuxtLink>
      </div>
    </div>

    <!-- Resultado -->
    <div v-if="result?.ok" class="mt-6 bg-white rounded-lg shadow p-6 max-w-2xl">
      <h2 class="text-lg font-semibold mb-4 text-green-700">✅ Importação Concluída!</h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-green-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-green-700">{{ result.created }}</div>
          <div class="text-sm text-green-600">Produtos Criados</div>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-blue-700">{{ result.updated }}</div>
          <div class="text-sm text-blue-600">Produtos Atualizados</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-purple-700">{{ result.categoriesCreated }}</div>
          <div class="text-sm text-purple-600">Categorias Criadas</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-gray-700">{{ result.totalProcessed }}</div>
          <div class="text-sm text-gray-600">Total Processado</div>
        </div>
      </div>

      <!-- Erros -->
      <div v-if="result.errors && result.errors.length > 0" class="mt-4">
        <h3 class="font-medium text-red-700 mb-2">⚠️ Erros ({{ result.errors.length }}):</h3>
        <div class="bg-red-50 p-4 rounded-lg max-h-60 overflow-y-auto">
          <ul class="text-sm text-red-700 space-y-1">
            <li v-for="(error, index) in result.errors" :key="index">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>

      <div v-else class="mt-4 p-4 bg-green-50 rounded-lg">
        <p class="text-green-700">🎉 Nenhum erro! Todos os produtos foram importados com sucesso.</p>
      </div>
    </div>
  </div>
</template>
