<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Importar WooCommerce</h1>
        <p class="text-sm text-gray-600 mt-1">Importa pedidos dos últimos 365 dias (inclui guest por e-mail).</p>
      </div>
    </div>

    <div class="bg-white rounded shadow p-6 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Páginas por execução</label>
          <input v-model.number="pagesPerRun" type="number" min="1" max="25" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Itens por página</label>
          <input v-model.number="perPage" type="number" min="10" max="100" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">After (opcional)</label>
          <input v-model="after" placeholder="ISO (ex: 2025-01-01T00:00:00.000Z)" class="w-full border p-2 rounded" />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          :disabled="loading"
          @click="runImport(false)"
        >
          {{ loading ? 'Executando...' : 'Executar próximo lote' }}
        </button>

        <button
          class="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50"
          :disabled="loading"
          @click="runImport(true)"
        >
          Reiniciar import
        </button>

        <button class="px-4 py-2 rounded-lg border" :disabled="loading" @click="refreshAll">Atualizar status</button>
      </div>

      <div v-if="error" class="text-red-700 text-sm font-medium">{{ error }}</div>
      <div v-if="message" class="text-green-700 text-sm font-medium">{{ message }}</div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div class="border rounded p-4">
          <div class="text-sm text-gray-500">Status</div>
          <div class="mt-1 font-mono text-sm">done: {{ status?.state?.done ?? '-' }}</div>
          <div class="mt-1 font-mono text-sm">nextPage: {{ status?.state?.nextPage ?? '-' }}</div>
          <div class="mt-1 font-mono text-sm">after: {{ status?.state?.after ?? '-' }}</div>
          <div class="mt-1 font-mono text-sm">updatedAt: {{ status?.state?.updatedAt ?? '-' }}</div>
        </div>

        <div class="border rounded p-4">
          <div class="text-sm text-gray-500">Última execução</div>
          <div class="mt-1 font-mono text-sm">processedOrders: {{ lastRun?.processedOrders ?? '-' }}</div>
          <div class="mt-1 font-mono text-sm">createdOrders: {{ lastRun?.createdOrders ?? '-' }}</div>
          <div class="mt-1 font-mono text-sm">updatedOrders: {{ lastRun?.updatedOrders ?? '-' }}</div>
          <div class="mt-1 font-mono text-sm">upsertedCustomers: {{ lastRun?.upsertedCustomers ?? '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const pagesPerRun = ref(3)
const perPage = ref(100)
const after = ref('')

const loading = ref(false)
const error = ref('')
const message = ref('')

const status = ref<any>(null)
const lastRun = ref<any>(null)

async function refreshAll() {
  error.value = ''
  message.value = ''
  try {
    status.value = await $fetch('/api/admin/woocommerce/status')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao carregar status'
  }
}

async function runImport(forceRestart: boolean) {
  loading.value = true
  error.value = ''
  message.value = ''

  try {
    const res = await $fetch('/api/admin/woocommerce/import', {
      method: 'POST',
      body: {
        pagesPerRun: pagesPerRun.value,
        perPage: perPage.value,
        after: after.value.trim() || undefined,
        forceRestart
      }
    })

    lastRun.value = res
    await refreshAll()
    message.value = res.done ? 'Import finalizado.' : 'Lote executado com sucesso.'
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao executar import'
  } finally {
    loading.value = false
  }
}

onMounted(refreshAll)
</script>
