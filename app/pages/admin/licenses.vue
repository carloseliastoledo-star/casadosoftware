<template>
  <div class="min-h-screen bg-gray-100 p-10">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">

      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-2">Licenças disponíveis</h2>
        <p class="text-sm text-gray-600 mb-3">Total em estoque: {{ stockTotal }}</p>

        <div v-if="stockPending" class="text-sm text-gray-500">Carregando estoque...</div>
        <div v-else-if="stockError" class="text-sm text-red-600">Não foi possível carregar o estoque.</div>
        <div v-else class="bg-gray-50 border rounded-lg overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-gray-600 bg-gray-100">
              <tr>
                <th class="p-3 text-left">Produto</th>
                <th class="p-3 text-left">Slug</th>
                <th class="p-3 text-right">Disponíveis</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="it in stockItems"
                :key="it.produtoId"
                class="border-t hover:bg-white cursor-pointer"
                @click="openStockModal(it.produtoId, it.produto?.nome || it.produtoId)"
              >
                <td class="p-3">
                  <div class="font-medium">{{ it.produto?.nome || it.produtoId }}</div>
                </td>
                <td class="p-3 text-gray-600">{{ it.produto?.slug || '-' }}</td>
                <td class="p-3 text-right font-mono">{{ it.count }}</td>
              </tr>
              <tr v-if="!stockItems.length" class="border-t">
                <td class="p-3 text-gray-500" colspan="3">Nenhuma licença em estoque.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h1 class="text-2xl font-bold mb-6">
        Importar Licenças
      </h1>

      <div class="mb-6">
        <label class="block font-medium mb-2">Produto</label>
        <input
          v-model="productId"
          list="products"
          type="text"
          placeholder="ex: windows-11-pro"
          class="w-full border rounded-lg p-3"
        />

        <datalist id="products">
          <option v-for="p in produtos" :key="p.id" :value="p.slug">
            {{ p.nome }}
          </option>
        </datalist>
      </div>

      <div class="mb-6">
        <label class="block font-medium mb-2">Licenças (1 por linha)</label>
        <input
          type="file"
          accept=".txt,text/plain"
          @change="onFileChange"
          class="block w-full text-sm text-gray-600 mb-3"
        />
        <textarea
          v-model="keys"
          rows="8"
          placeholder="AAAAA-BBBBB-CCCCC-DDDDD"
          class="w-full border rounded-lg p-3 font-mono"
        />
      </div>

      <button
        @click="importLicenses"
        :disabled="loading"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {{ loading ? 'Importando...' : 'Importar Licenças' }}
      </button>

      <p v-if="message" class="mt-6 text-green-600 font-medium">
        {{ message }}
      </p>

      <p v-if="error" class="mt-6 text-red-600 font-medium">
        {{ error }}
      </p>

      <div v-if="showStock" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/40" @click="closeStockModal" />

        <div class="absolute inset-0 flex items-center justify-center p-4">
          <div class="bg-white w-full max-w-3xl rounded-xl shadow-lg max-h-[85vh] flex flex-col">
            <div class="flex items-center justify-between p-5 border-b shrink-0">
              <div>
                <h2 class="text-lg font-semibold">Licenças disponíveis</h2>
                <p class="text-sm text-gray-600 mt-1">{{ stockModalTitle }}</p>
              </div>

              <button class="text-gray-500 hover:text-gray-700" @click="closeStockModal">
                Fechar
              </button>
            </div>

            <div class="p-5 overflow-hidden flex-1 flex flex-col">
              <div v-if="stockKeysPending" class="text-sm text-gray-500">Carregando...</div>
              <div v-else-if="stockKeysError" class="text-sm text-red-600">Não foi possível carregar as licenças.</div>

              <div v-else class="border rounded-lg overflow-x-auto flex-1 overflow-y-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-100 text-gray-600">
                    <tr>
                      <th class="p-3 text-left w-10">
                        <input
                          type="checkbox"
                          :checked="allSelected"
                          :disabled="!stockKeys.length || stockKeysPending"
                          class="h-4 w-4 accent-blue-600"
                          @change="toggleSelectAll"
                        />
                      </th>
                      <th class="p-3 text-left">Chave</th>
                      <th class="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="k in stockKeys" :key="k.id" class="border-t">
                      <td class="p-3">
                        <input
                          type="checkbox"
                          :checked="selectedIds.includes(k.id)"
                          @click.stop
                          class="h-4 w-4 accent-blue-600"
                          @change="toggleSelected(k.id, $event)"
                        />
                      </td>
                      <td class="p-3 font-mono break-all">{{ k.chave }}</td>
                      <td class="p-3 text-right">
                        <button
                          class="text-red-600 hover:text-red-800 text-sm"
                          :disabled="deletingId === k.id"
                          @click.stop="deleteStockKey(k.id)"
                        >
                          {{ deletingId === k.id ? 'Apagando...' : 'Apagar' }}
                        </button>
                      </td>
                    </tr>
                    <tr v-if="!stockKeys.length" class="border-t">
                      <td class="p-3 text-gray-500" colspan="3">Sem licenças disponíveis.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mt-4 flex items-center justify-between shrink-0">
                <div class="text-sm text-gray-600">
                  Total: {{ stockKeysTotal }}
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="px-3 py-2 rounded-lg border text-red-700 border-red-200 bg-red-50 disabled:opacity-50"
                    :disabled="!selectedIds.length || stockKeysPending"
                    @click="deleteSelected"
                  >
                    Excluir selecionadas ({{ selectedIds.length }})
                  </button>
                  <button
                    class="px-3 py-2 rounded-lg border text-red-700 border-red-200 bg-red-50 disabled:opacity-50"
                    :disabled="!stockProdutoId || stockKeysPending"
                    @click="deleteAllFromProduct"
                  >
                    Excluir todas
                  </button>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="px-3 py-2 rounded-lg border disabled:opacity-50"
                    :disabled="stockKeysPage <= 1 || stockKeysPending"
                    @click="prevStockPage"
                  >
                    Anterior
                  </button>
                  <div class="text-sm text-gray-600">Página {{ stockKeysPage }}</div>
                  <button
                    class="px-3 py-2 rounded-lg border disabled:opacity-50"
                    :disabled="!canNextStockPage || stockKeysPending"
                    @click="nextStockPage"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'admin' })

const deletingId = ref('')

type ProdutoDto = {
  id: string
  nome: string
  slug: string
  preco: number
}

const { data: produtosData } = await useFetch<ProdutoDto[]>('/api/admin/produtos', {
  server: false
})

const produtos = computed(() => produtosData.value || [])

type StockItem = {
  produtoId: string
  produto: { id: string; nome: string; slug: string } | null
  count: number
}

const {
  data: stockData,
  pending: stockPending,
  error: stockError,
  refresh: refreshStock
} = await useFetch<{ ok: true; total: number; items: StockItem[] }>('/api/admin/licenses/stock', {
  server: false
})

const stockItems = computed(() => stockData.value?.items || [])
const stockTotal = computed(() => stockData.value?.total || 0)

type StockKey = {
  id: string
  chave: string
  status: string
}

const showStock = ref(false)
const stockModalTitle = ref('')
const stockProdutoId = ref('')
const stockKeysPage = ref(1)
const stockKeysPageSize = ref(100)
const selectedIds = ref<string[]>([])

const {
  data: stockKeysData,
  pending: stockKeysPending,
  error: stockKeysError,
  refresh: refreshStockKeys
} = await useFetch<
  { ok: true; page: number; pageSize: number; total: number; items: StockKey[] }
>('/api/admin/licenses/stock-keys', {
  server: false,
  query: computed(() => ({
    produtoId: stockProdutoId.value,
    page: stockKeysPage.value,
    pageSize: stockKeysPageSize.value
  }))
})

const stockKeys = computed(() => stockKeysData.value?.items || [])
const stockKeysTotal = computed(() => stockKeysData.value?.total || 0)
const allSelected = computed(() => {
  if (!stockKeys.value.length) return false
  return stockKeys.value.every((k) => selectedIds.value.includes(k.id))
})
const canNextStockPage = computed(() => {
  const total = stockKeysTotal.value
  const page = stockKeysPage.value
  const size = stockKeysPageSize.value
  return page * size < total
})

const productId = ref('')
const keys = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    keys.value = text
  } finally {
    input.value = ''
  }
}

async function importLicenses() {
  loading.value = true
  message.value = ''
  error.value = ''

  try {
    const raw = productId.value.trim()

    const match = produtos.value.find((p) => {
      if (p.slug === raw || p.id === raw) return true
      return p.nome?.trim().toLowerCase() === raw.toLowerCase()
    })

    const product_id = match?.slug || raw

    const res = await $fetch('/api/admin/licenses/import', {
      method: 'POST',
      body: {
        product_id,
        keys: keys.value
      }
    })

    message.value = `Licenças importadas com sucesso: ${res.inserted}`
    keys.value = ''
    await refreshStock()
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao importar licenças'
  } finally {
    loading.value = false
  }
}

async function openStockModal(produtoId: string, title: string) {
  stockProdutoId.value = produtoId
  stockModalTitle.value = title
  stockKeysPage.value = 1
  selectedIds.value = []
  showStock.value = true
  await refreshStockKeys()
}

function closeStockModal() {
  showStock.value = false
  selectedIds.value = []
}

function toggleSelected(id: string, ev: Event) {
  const checked = Boolean((ev.target as HTMLInputElement | null)?.checked)
  const current = selectedIds.value
  if (checked) {
    if (!current.includes(id)) selectedIds.value = [...current, id]
  } else {
    selectedIds.value = current.filter((x) => x !== id)
  }
}

function toggleSelectAll(ev: Event) {
  const checked = Boolean((ev.target as HTMLInputElement | null)?.checked)
  if (!checked) {
    selectedIds.value = []
    return
  }

  selectedIds.value = stockKeys.value.map((k) => k.id)
}

async function nextStockPage() {
  if (!canNextStockPage.value) return
  stockKeysPage.value += 1
  selectedIds.value = []
  await refreshStockKeys()
}

async function prevStockPage() {
  if (stockKeysPage.value <= 1) return
  stockKeysPage.value -= 1
  selectedIds.value = []
  await refreshStockKeys()
}

async function deleteStockKey(id: string) {
  if (!id) return
  if (!confirm('Tem certeza que deseja apagar esta licença do estoque?')) return

  deletingId.value = id
  try {
    await $fetch(`/api/admin/licenses/${id}`, { method: 'DELETE' })
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
    await Promise.all([refreshStockKeys(), refreshStock()])
  } finally {
    deletingId.value = ''
  }
}

async function deleteSelected() {
  if (!selectedIds.value.length) return
  if (!confirm(`Tem certeza que deseja apagar ${selectedIds.value.length} licenças selecionadas?`)) return

  deletingId.value = '__bulk__'
  try {
    await $fetch('/api/admin/licenses/bulk-delete', {
      method: 'POST',
      body: { ids: selectedIds.value }
    })
    selectedIds.value = []
    await Promise.all([refreshStockKeys(), refreshStock()])
  } finally {
    deletingId.value = ''
  }
}

async function deleteAllFromProduct() {
  if (!stockProdutoId.value) return
  if (!confirm('Tem certeza que deseja apagar TODAS as licenças em estoque deste produto?')) return

  deletingId.value = '__bulk_all__'
  try {
    await $fetch('/api/admin/licenses/bulk-delete', {
      method: 'POST',
      body: { deleteAll: true, produtoId: stockProdutoId.value }
    })
    selectedIds.value = []
    await Promise.all([refreshStockKeys(), refreshStock()])
  } finally {
    deletingId.value = ''
  }
}
</script>
