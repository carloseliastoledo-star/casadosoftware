<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Pedidos</h1>
        <p class="text-sm text-gray-600 mt-1">Lista de pedidos e status.</p>
      </div>

      <button
        @click="openImportModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Importar licenças (.txt)
      </button>
    </div>

    <div v-if="pending" class="text-gray-500">Carregando...</div>
    <div v-else-if="error" class="text-red-600">Não foi possível carregar os pedidos.</div>

    <div v-else class="bg-white rounded shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600">
          <tr>
            <th class="p-3 text-left">Pedido</th>
            <th class="p-3 text-left">Produto</th>
            <th class="p-3 text-left">Cliente</th>
            <th class="p-3 text-left">Status</th>
            <th class="p-3 text-left">Criado</th>
            <th class="p-3 text-left">Pago</th>
            <th class="p-3 text-left">Licenças</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="o in orders" :key="o.id" class="border-t">
            <td class="p-3 font-mono text-xs">{{ o.id }}</td>
            <td class="p-3">
              <div class="font-medium">{{ o.produto?.nome }}</div>
              <div class="text-xs text-gray-500">{{ o.produto?.slug }}</div>
            </td>
            <td class="p-3">
              <div class="font-medium">{{ o.customer?.email }}</div>
              <div v-if="o.customer?.nome" class="text-xs text-gray-500">{{ o.customer?.nome }}</div>
              <div v-if="o.customer?.whatsapp" class="text-xs text-gray-500">WhatsApp: {{ o.customer?.whatsapp }}</div>
              <div v-if="o.customer?.cpf" class="text-xs text-gray-500">CPF: {{ o.customer?.cpf }}</div>
            </td>
            <td class="p-3">
              <span
                class="px-2 py-1 rounded"
                :class="o.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-gray-100'"
              >
                {{ o.status }}
              </span>
            </td>
            <td class="p-3 text-xs text-gray-600">{{ formatDate(o.criadoEm) }}</td>
            <td class="p-3 text-xs text-gray-600">{{ o.pagoEm ? formatDate(o.pagoEm) : '-' }}</td>
            <td class="p-3">
              <div v-if="!o.licencas?.length" class="text-xs text-gray-500">-</div>
              <div v-else class="space-y-1">
                <div v-for="l in o.licencas" :key="l.id" class="text-xs">
                  <div class="text-gray-500">{{ l.status }}</div>
                  <div class="font-mono break-all">{{ l.chave }}</div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showImport" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="closeImportModal" />

      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-2xl rounded-xl shadow-lg">
          <div class="flex items-center justify-between p-5 border-b">
            <div>
              <h2 class="text-lg font-semibold">Importar licenças em lote</h2>
              <p class="text-sm text-gray-600 mt-1">Selecione um produto e envie um .txt (1 licença por linha).</p>
            </div>

            <button class="text-gray-500 hover:text-gray-700" @click="closeImportModal">
              Fechar
            </button>
          </div>

          <div class="p-5 space-y-5">
            <div>
              <label class="block font-medium mb-2">Produto</label>
              <input
                v-model="importProduct"
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

            <div>
              <label class="block font-medium mb-2">Arquivo (.txt)</label>
              <input
                type="file"
                accept=".txt,text/plain"
                @change="onImportFileChange"
                class="block w-full text-sm text-gray-600"
              />
            </div>

            <div>
              <label class="block font-medium mb-2">Licenças (1 por linha)</label>
              <textarea
                v-model="importKeys"
                rows="8"
                placeholder="AAAAA-BBBBB-CCCCC-DDDDD"
                class="w-full border rounded-lg p-3 font-mono"
              />
            </div>

            <div v-if="importMessage" class="text-green-700 text-sm font-medium">
              {{ importMessage }}
            </div>
            <div v-if="importError" class="text-red-700 text-sm font-medium">
              {{ importError }}
            </div>
          </div>

          <div class="p-5 border-t flex items-center justify-end gap-3">
            <button class="px-4 py-2 rounded-lg border" @click="closeImportModal" :disabled="importLoading">
              Cancelar
            </button>

            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              @click="importLicenses"
              :disabled="importLoading"
            >
              {{ importLoading ? 'Importando...' : 'Importar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type ProdutoDto = {
  id: string
  nome: string
  slug: string
  preco: number
}

type OrderDto = {
  id: string
  status: string
  criadoEm: string
  pagoEm: string | null
  emailEnviadoEm: string | null
  mercadoPagoPaymentId: string | null
  produto: { id: string; nome: string; slug: string } | null
  customer: { id: string; email: string; nome: string | null; whatsapp: string | null; cpf: string | null } | null
  licencas: { id: string; chave: string; status: string }[]
}

const { data, pending, error, refresh } = await useFetch<{ ok: true; orders: OrderDto[] }>('/api/admin/pedidos', {
  server: false
})

const { data: produtosData } = await useFetch<ProdutoDto[]>('/api/admin/produtos', {
  server: false
})

const produtos = computed(() => produtosData.value || [])

const orders = computed(() => data.value?.orders || [])

const showImport = ref(false)
const importProduct = ref('')
const importKeys = ref('')
const importLoading = ref(false)
const importMessage = ref('')
const importError = ref('')

function openImportModal() {
  showImport.value = true
  importMessage.value = ''
  importError.value = ''
}

function closeImportModal() {
  showImport.value = false
}

async function onImportFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    importKeys.value = text
  } finally {
    input.value = ''
  }
}

async function importLicenses() {
  importLoading.value = true
  importMessage.value = ''
  importError.value = ''

  try {
    const raw = importProduct.value.trim()
    const match = produtos.value.find((p) => {
      if (p.slug === raw || p.id === raw) return true
      return p.nome?.trim().toLowerCase() === raw.toLowerCase()
    })

    const product_id = match?.slug || raw

    const res = await $fetch('/api/admin/licenses/import', {
      method: 'POST',
      body: {
        product_id,
        keys: importKeys.value
      }
    })

    importMessage.value = `Licenças importadas com sucesso: ${res.inserted}`
    importKeys.value = ''
    await refresh()
  } catch (err: any) {
    importError.value = err?.data?.statusMessage || 'Erro ao importar licenças'
  } finally {
    importLoading.value = false
  }
}

function formatDate(input: string) {
  try {
    return new Date(input).toLocaleString('pt-BR')
  } catch {
    return input
  }
}
</script>
