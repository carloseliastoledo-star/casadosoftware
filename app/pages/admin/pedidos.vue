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

    <div v-else class="bg-white rounded shadow overflow-x-auto -mx-4 md:-mx-8">
      <table class="min-w-max w-full text-sm">
        <thead class="bg-gray-100 text-gray-600">
          <tr>
            <th class="px-2 py-2 text-left">Pedido</th>
            <th class="px-2 py-2 text-left">Produto</th>
            <th class="px-2 py-2 text-left">Cliente</th>
            <th class="px-2 py-2 text-left">Status</th>
            <th class="px-2 py-2 text-left">Pagamento</th>
            <th class="px-2 py-2 text-left">Criado</th>
            <th class="px-2 py-2 text-left">Pago</th>
            <th class="px-2 py-2 text-left">Entrega</th>
            <th class="px-2 py-2 text-left">Licenças</th>
            <th class="px-2 py-2 text-left">Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="o in orders" :key="o.id" class="border-t">
            <td class="px-2 py-2">
              <div class="font-mono text-xs">#{{ o.numero }}</div>
              <div class="font-mono text-xs text-gray-400">{{ o.id }}</div>
            </td>
            <td class="px-2 py-2">
              <div class="font-medium">{{ o.produto?.nome }}</div>
              <div class="text-xs text-gray-500">{{ o.produto?.slug }}</div>
            </td>
            <td class="px-2 py-2">
              <div class="font-medium">{{ o.customer?.email }}</div>
              <div v-if="o.customer?.nome" class="text-xs text-gray-500">{{ o.customer?.nome }}</div>
              <div v-if="o.customer?.whatsapp" class="text-xs text-gray-500">WhatsApp: {{ o.customer?.whatsapp }}</div>
              <div v-if="o.customer?.cpf" class="text-xs text-gray-500">CPF: {{ o.customer?.cpf }}</div>
            </td>
            <td class="px-2 py-2">
              <span
                class="px-2 py-1 rounded"
                :class="o.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-gray-100'"
              >
                {{ o.status }}
              </span>
            </td>
            <td class="px-2 py-2 text-xs text-gray-700">
              <div v-if="o.mercadoPagoPaymentTypeId || o.mercadoPagoPaymentMethodId">
                <div class="font-mono">{{ o.mercadoPagoPaymentTypeId || '-' }}</div>
                <div class="font-mono text-gray-400">{{ o.mercadoPagoPaymentMethodId || '-' }}</div>
              </div>
              <div v-else class="text-gray-500">-</div>
            </td>
            <td class="px-2 py-2 text-xs text-gray-600">{{ formatDate(o.criadoEm) }}</td>
            <td class="px-2 py-2 text-xs text-gray-600">{{ o.pagoEm ? formatDate(o.pagoEm) : '-' }}</td>
            <td class="px-2 py-2">
              <div v-if="o.fulfillmentStatus" class="text-xs">
                <div class="text-gray-700 font-medium">{{ o.fulfillmentStatus }}</div>
                <div v-if="o.fulfillmentError" class="text-gray-500 mt-1">{{ o.fulfillmentError }}</div>
              </div>
              <div v-else class="text-xs text-gray-500">-</div>
            </td>
            <td class="px-2 py-2">
              <div v-if="!o.licencas?.length" class="text-xs text-gray-500">-</div>
              <div v-else class="space-y-1">
                <div v-for="l in o.licencas" :key="l.id" class="text-xs">
                  <div class="text-gray-500">{{ l.status }}</div>
                  <div class="font-mono break-all">{{ l.chave }}</div>
                </div>
              </div>
            </td>
            <td class="px-2 py-2">
              <div class="flex items-center gap-3">
                <button class="text-blue-600 hover:text-blue-800" @click="openEditModal(o)">
                  Editar
                </button>
                <button
                  v-if="canResend(o)"
                  class="text-indigo-700 hover:text-indigo-900"
                  @click="resendOrder(o)"
                >
                  Reenviar e-mail
                </button>
                <button
                  v-if="canManualFulfill(o)"
                  class="text-emerald-700 hover:text-emerald-900"
                  @click="openFulfillModal(o)"
                >
                  Entregar licença
                </button>
                <button class="text-red-600 hover:text-red-800" @click="deleteOrder(o)">
                  Apagar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showEdit" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="closeEditModal" />

      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-xl rounded-xl shadow-lg">
          <div class="flex items-center justify-between p-5 border-b">
            <div>
              <h2 class="text-lg font-semibold">Editar pedido</h2>
              <p class="text-sm text-gray-600 mt-1 font-mono">{{ editOrder?.id }}</p>
            </div>
            <button class="text-gray-500 hover:text-gray-700" @click="closeEditModal">Fechar</button>
          </div>

          <div class="p-5 space-y-4">
            <div>
              <label class="block font-medium mb-2">Status</label>
              <select v-model="editStatus" class="w-full border rounded-lg p-3">
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <p class="text-xs text-gray-500 mt-2">Pedidos com licença vinculada não podem voltar para status diferente de PAID.</p>
            </div>

            <div v-if="editMessage" class="text-green-700 text-sm font-medium">{{ editMessage }}</div>
            <div v-if="editError" class="text-red-700 text-sm font-medium">{{ editError }}</div>
          </div>

          <div class="p-5 border-t flex items-center justify-end gap-3">
            <button class="px-4 py-2 rounded-lg border" @click="closeEditModal" :disabled="editLoading">Cancelar</button>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              @click="saveEdit"
              :disabled="editLoading"
            >
              {{ editLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
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

    <div v-if="showFulfill" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="closeFulfillModal" />

      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-2xl rounded-xl shadow-lg">
          <div class="flex items-center justify-between p-5 border-b">
            <div>
              <h2 class="text-lg font-semibold">Entrega manual de licença</h2>
              <p class="text-sm text-gray-600 mt-1 font-mono">{{ fulfillOrder?.id }}</p>
            </div>
            <button class="text-gray-500 hover:text-gray-700" @click="closeFulfillModal">Fechar</button>
          </div>

          <div class="p-5 space-y-4">
            <div class="text-sm text-gray-700">
              <div><span class="font-semibold">Produto:</span> {{ fulfillOrder?.produto?.nome }}</div>
              <div><span class="font-semibold">Cliente:</span> {{ fulfillOrder?.customer?.email }}</div>
            </div>

            <div v-if="fulfillLoadingKeys" class="text-sm text-gray-500">
              Carregando licenças em estoque...
            </div>
            <div v-else-if="fulfillKeysError" class="text-sm text-red-700">
              {{ fulfillKeysError }}
            </div>

            <div v-else>
              <label class="block font-medium mb-2">Selecione uma licença (estoque)</label>
              <select v-model="selectedLicencaId" class="w-full border rounded-lg p-3">
                <option value="">Selecione...</option>
                <option v-for="k in fulfillKeys" :key="k.id" :value="k.id">
                  {{ k.chave }}
                </option>
              </select>
              <p v-if="!fulfillKeys.length" class="text-xs text-gray-500 mt-2">
                Não há licenças em estoque para este produto.
              </p>
            </div>

            <div v-if="fulfillMessage" class="text-green-700 text-sm font-medium">{{ fulfillMessage }}</div>
            <div v-if="fulfillError" class="text-red-700 text-sm font-medium">{{ fulfillError }}</div>
          </div>

          <div class="p-5 border-t flex items-center justify-end gap-3">
            <button class="px-4 py-2 rounded-lg border" @click="closeFulfillModal" :disabled="fulfillSubmitting">
              Cancelar
            </button>
            <button
              class="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              @click="submitFulfill"
              :disabled="fulfillSubmitting || !selectedLicencaId"
            >
              {{ fulfillSubmitting ? 'Enviando...' : 'Vincular e enviar' }}
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
  numero: number
  status: string
  criadoEm: string
  pagoEm: string | null
  emailEnviadoEm: string | null
  fulfillmentStatus: string | null
  fulfillmentError: string | null
  fulfillmentUpdatedAt: string | null
  mercadoPagoPaymentId: string | null
  mercadoPagoPaymentTypeId: string | null
  mercadoPagoPaymentMethodId: string | null
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

const showEdit = ref(false)
const editOrder = ref<OrderDto | null>(null)
const editStatus = ref('PENDING')
const editLoading = ref(false)
const editMessage = ref('')
const editError = ref('')

const showImport = ref(false)
const importProduct = ref('')
const importKeys = ref('')
const importLoading = ref(false)
const importMessage = ref('')
const importError = ref('')

type StockKey = {
  id: string
  chave: string
  status: string
}

const showFulfill = ref(false)
const fulfillOrder = ref<OrderDto | null>(null)
const fulfillKeys = ref<StockKey[]>([])
const fulfillLoadingKeys = ref(false)
const fulfillKeysError = ref('')
const selectedLicencaId = ref('')
const fulfillSubmitting = ref(false)
const fulfillMessage = ref('')
const fulfillError = ref('')

function openImportModal() {
  showImport.value = true
  importMessage.value = ''
  importError.value = ''
}

function closeImportModal() {
  showImport.value = false
}

function canManualFulfill(o: OrderDto) {
  return String(o.status || '').toUpperCase() === 'PAID' && (!o.licencas || o.licencas.length === 0)
}

function canResend(o: OrderDto) {
  return String(o.status || '').toUpperCase() === 'PAID' && Array.isArray(o.licencas) && o.licencas.length > 0
}

async function resendOrder(o: OrderDto) {
  if (!o?.id) return
  if (!confirm('Reenviar o e-mail de entrega deste pedido para o cliente?')) return

  try {
    await $fetch(`/api/admin/pedidos/${o.id}/resend`, { method: 'POST' })
    alert('E-mail reenviado com sucesso.')
    await refresh()
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Erro ao reenviar e-mail')
  }
}

async function openFulfillModal(o: OrderDto) {
  showFulfill.value = true
  fulfillOrder.value = o
  selectedLicencaId.value = ''
  fulfillMessage.value = ''
  fulfillError.value = ''
  fulfillKeysError.value = ''
  fulfillKeys.value = []

  const produtoId = o?.produto?.id || ''
  if (!produtoId) {
    fulfillKeysError.value = 'Produto do pedido não encontrado.'
    return
  }

  fulfillLoadingKeys.value = true
  try {
    const res: any = await $fetch('/api/admin/licenses/stock-keys', {
      query: {
        produtoId,
        page: 1,
        pageSize: 200
      }
    })
    fulfillKeys.value = Array.isArray(res?.items) ? res.items : []
  } catch (err: any) {
    fulfillKeysError.value = err?.data?.statusMessage || 'Erro ao carregar licenças em estoque'
  } finally {
    fulfillLoadingKeys.value = false
  }
}

function closeFulfillModal() {
  showFulfill.value = false
  fulfillOrder.value = null
  fulfillKeys.value = []
  fulfillKeysError.value = ''
  selectedLicencaId.value = ''
  fulfillSubmitting.value = false
  fulfillMessage.value = ''
  fulfillError.value = ''
}

async function submitFulfill() {
  if (!fulfillOrder.value?.id) return
  if (!selectedLicencaId.value) return

  fulfillSubmitting.value = true
  fulfillMessage.value = ''
  fulfillError.value = ''
  try {
    await $fetch(`/api/admin/pedidos/${fulfillOrder.value.id}/fulfill`, {
      method: 'POST',
      body: { licencaId: selectedLicencaId.value }
    })
    fulfillMessage.value = 'Licença vinculada e e-mail enviado com sucesso.'
    await refresh()
    closeFulfillModal()
  } catch (err: any) {
    fulfillError.value = err?.data?.statusMessage || 'Erro ao vincular/enviar licença'
  } finally {
    fulfillSubmitting.value = false
  }
}

function openEditModal(o: OrderDto) {
  showEdit.value = true
  editOrder.value = o
  editStatus.value = String(o.status || 'PENDING')
  editMessage.value = ''
  editError.value = ''
}

function closeEditModal() {
  showEdit.value = false
  editOrder.value = null
}

async function saveEdit() {
  if (!editOrder.value?.id) return

  editLoading.value = true
  editMessage.value = ''
  editError.value = ''

  try {
    await $fetch(`/api/admin/pedidos/${editOrder.value.id}`, {
      method: 'PATCH',
      body: { status: editStatus.value }
    })
    editMessage.value = 'Pedido atualizado com sucesso.'
    await refresh()
    closeEditModal()
  } catch (err: any) {
    editError.value = err?.data?.statusMessage || 'Erro ao atualizar pedido'
  } finally {
    editLoading.value = false
  }
}

async function deleteOrder(o: OrderDto) {
  if (!o?.id) return

  if (!confirm('Tem certeza que deseja apagar este pedido?')) return

  try {
    await $fetch(`/api/admin/pedidos/${o.id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Erro ao apagar pedido')
  }
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
