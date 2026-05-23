<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const loading = ref(false)
const checkResult = ref<any>(null)
const syncResult = ref<any>(null)
const error = ref<string | null>(null)
const manualPaymentId = ref('')
const manualPayment = ref<any>(null)
const manualLoading = ref(false)
const selectedProdutoId = ref('')
const manualEmail = ref('')
const manualNome = ref('')
const produtos = ref<any[]>([])

async function checkTodayPayments() {
  loading.value = true
  error.value = null
  checkResult.value = null
  syncResult.value = null

  try {
    const response = await $fetch('/api/admin/sync-mp-today', {
      method: 'POST',
      body: { action: 'check' }
    })
    checkResult.value = response
  } catch (err: any) {
    error.value = err?.message || 'Erro ao verificar vendas'
    console.error('Erro ao verificar vendas:', err)
  } finally {
    loading.value = false
  }
}

async function syncTodayPayments() {
  if (!confirm('Deseja sincronizar as vendas perdidas do Mercado Pago?')) {
    return
  }

  loading.value = true
  error.value = null
  syncResult.value = null

  try {
    const response = await $fetch('/api/admin/sync-mp-today', {
      method: 'POST',
      body: { action: 'sync' }
    })
    syncResult.value = response
    checkResult.value = null // Limpar check após sync
  } catch (err: any) {
    error.value = err?.message || 'Erro ao sincronizar vendas'
    console.error('Erro ao sincronizar vendas:', err)
  } finally {
    loading.value = false
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('pt-BR')
}

async function loadProdutos() {
  try {
    console.log('[loadProdutos] Iniciando carregamento de produtos')
    const response = await $fetch('/api/admin/produtos')
    console.log('[loadProdutos] Response:', response)
    produtos.value = Array.isArray(response) ? response : []
    console.log('[loadProdutos] Produtos carregados:', produtos.value.length)
  } catch (err: any) {
    console.error('[loadProdutos] Erro ao carregar produtos:', err)
    console.error('[loadProdutos] Erro status:', err?.statusCode)
    console.error('[loadProdutos] Erro message:', err?.message)
  }
}

async function searchManualPayment() {
  if (!manualPaymentId.value.trim()) {
    error.value = 'Informe um Payment ID'
    return
  }

  manualLoading.value = true
  error.value = null
  manualPayment.value = null

  try {
    const response = await $fetch(`/api/admin/mp-payment?paymentId=${manualPaymentId.value}`)
    manualPayment.value = response.payment
    
    // Preencher campos com dados do pagamento
    if (response.payment?.payer?.email) {
      manualEmail.value = response.payment.payer.email
    }
    if (response.payment?.payer?.first_name) {
      manualNome.value = `${response.payment.payer.first_name} ${response.payment.payer.last_name || ''}`.trim()
    }
  } catch (err: any) {
    error.value = err?.message || 'Erro ao buscar pagamento'
    console.error('Erro ao buscar pagamento:', err)
  } finally {
    manualLoading.value = false
  }
}

async function importManualPayment() {
  if (!manualPayment.value) {
    error.value = 'Busque um pagamento primeiro'
    return
  }
  if (!selectedProdutoId.value) {
    error.value = 'Selecione um produto'
    return
  }
  if (!manualEmail.value || !manualEmail.value.includes('@')) {
    error.value = 'Informe um email válido'
    return
  }
  if (!manualNome.value) {
    error.value = 'Informe o nome do cliente'
    return
  }

  if (!confirm('Deseja importar este pagamento manualmente?')) {
    return
  }

  manualLoading.value = true
  error.value = null

  try {
    const response = await $fetch('/api/admin/import-mp-payment', {
      method: 'POST',
      body: {
        paymentId: manualPayment.value.paymentId,
        produtoId: selectedProdutoId.value,
        email: manualEmail.value,
        nome: manualNome.value,
        externalReference: manualPayment.value.external_reference,
        valor: manualPayment.value.transaction_amount,
        status: manualPayment.value.status
      }
    })

    alert('Pagamento importado com sucesso!')
    manualPayment.value = null
    manualPaymentId.value = ''
    selectedProdutoId.value = ''
    manualEmail.value = ''
    manualNome.value = ''
  } catch (err: any) {
    error.value = err?.message || 'Erro ao importar pagamento'
    console.error('Erro ao importar pagamento:', err)
  } finally {
    manualLoading.value = false
  }
}

// Carregar produtos ao montar a página
onMounted(() => {
  loadProdutos()
})
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Sincronização Mercado Pago</h1>

    <!-- Erro -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Botões -->
    <div class="flex gap-4 mb-6">
      <button
        @click="checkTodayPayments"
        :disabled="loading"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {{ loading ? 'Verificando...' : 'Verificar vendas Mercado Pago de hoje' }}
      </button>
    </div>

    <!-- Importação Manual -->
    <div class="bg-white border rounded-lg p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Importar Pagamento Manualmente</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Payment ID Mercado Pago</label>
          <input
            v-model="manualPaymentId"
            type="text"
            placeholder="Ex: 159877389159"
            class="w-full border rounded px-3 py-2"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="searchManualPayment"
            :disabled="manualLoading"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {{ manualLoading ? 'Buscando...' : 'Buscar Pagamento' }}
          </button>
        </div>
      </div>

      <!-- Dados do Pagamento -->
      <div v-if="manualPayment" class="bg-gray-50 p-4 rounded mb-4">
        <h3 class="font-semibold mb-2">Dados do Pagamento</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div><strong>Payment ID:</strong> {{ manualPayment.paymentId }}</div>
          <div><strong>Status:</strong> {{ manualPayment.status }}</div>
          <div><strong>Valor:</strong> {{ formatCurrency(manualPayment.transaction_amount) }}</div>
          <div><strong>Data:</strong> {{ formatDate(manualPayment.date_created) }}</div>
          <div><strong>External Reference:</strong> {{ manualPayment.external_reference || '-' }}</div>
          <div><strong>Email MP:</strong> {{ manualPayment.payer?.email || '-' }}</div>
        </div>
      </div>

      <!-- Formulário de Importação -->
      <div v-if="manualPayment" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Produto</label>
          <select
            v-model="selectedProdutoId"
            class="w-full border rounded px-3 py-2"
          >
            <option value="">Selecione um produto</option>
            <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
              {{ produto.nome }} - {{ formatCurrency(produto.preco) }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email do Cliente</label>
          <input
            v-model="manualEmail"
            type="email"
            placeholder="cliente@email.com"
            class="w-full border rounded px-3 py-2"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
          <input
            v-model="manualNome"
            type="text"
            placeholder="Nome completo"
            class="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <button
        v-if="manualPayment"
        @click="importManualPayment"
        :disabled="manualLoading"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {{ manualLoading ? 'Importando...' : 'Importar Pagamento' }}
      </button>
    </div>

    <!-- Resultado do Check -->
    <div v-if="checkResult" class="bg-white border rounded-lg p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Resultado da Verificação</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded">
          <div class="text-sm text-gray-600">Pagamentos Mercado Pago</div>
          <div class="text-2xl font-bold text-blue-600">{{ checkResult.totalMpPayments }}</div>
        </div>
        <div class="bg-green-50 p-4 rounded">
          <div class="text-sm text-gray-600">Pedidos no Banco</div>
          <div class="text-2xl font-bold text-green-600">{{ checkResult.totalDbOrders }}</div>
        </div>
        <div class="bg-red-50 p-4 rounded">
          <div class="text-sm text-gray-600">Vendas Perdidas</div>
          <div class="text-2xl font-bold text-red-600">{{ checkResult.missingPayments.length }}</div>
        </div>
      </div>

      <!-- Vendas Perdidas -->
      <div v-if="checkResult.missingPayments.length > 0">
        <h3 class="text-md font-semibold mb-3 text-red-600">
          Vendas no Mercado Pago sem pedido no banco ({{ checkResult.missingPayments.length }})
        </h3>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left">Payment ID</th>
                <th class="px-4 py-2 text-left">Status</th>
                <th class="px-4 py-2 text-left">Valor</th>
                <th class="px-4 py-2 text-left">Data</th>
                <th class="px-4 py-2 text-left">Email</th>
                <th class="px-4 py-2 text-left">External Reference</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in checkResult.missingPayments" :key="payment.paymentId" class="border-b">
                <td class="px-4 py-2 font-mono text-xs">{{ payment.paymentId }}</td>
                <td class="px-4 py-2">
                  <span :class="{
                    'bg-green-100 text-green-800': payment.status === 'approved',
                    'bg-yellow-100 text-yellow-800': payment.status === 'pending',
                    'bg-red-100 text-red-800': payment.status === 'rejected'
                  }" class="px-2 py-1 rounded text-xs">
                    {{ payment.status }}
                  </span>
                </td>
                <td class="px-4 py-2">{{ formatCurrency(payment.amount) }}</td>
                <td class="px-4 py-2">{{ formatDate(payment.date) }}</td>
                <td class="px-4 py-2">{{ payment.email || '-' }}</td>
                <td class="px-4 py-2 font-mono text-xs">{{ payment.externalReference || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          @click="syncTodayPayments"
          :disabled="loading"
          class="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {{ loading ? 'Sincronizando...' : 'Sincronizar vendas perdidas' }}
        </button>
      </div>

      <div v-else class="text-green-600 font-semibold">
        ✓ Todas as vendas do Mercado Pago têm pedido correspondente no banco
      </div>
    </div>

    <!-- Resultado do Sync -->
    <div v-if="syncResult" class="bg-white border rounded-lg p-6">
      <h2 class="text-lg font-semibold mb-4">Resultado da Sincronização</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-green-50 p-4 rounded">
          <div class="text-sm text-gray-600">Sincronizados com Sucesso</div>
          <div class="text-2xl font-bold text-green-600">{{ syncResult.synced }}</div>
        </div>
        <div class="bg-red-50 p-4 rounded">
          <div class="text-sm text-gray-600">Erros</div>
          <div class="text-2xl font-bold text-red-600">{{ syncResult.errors }}</div>
        </div>
        <div class="bg-blue-50 p-4 rounded">
          <div class="text-sm text-gray-600">Total Processado</div>
          <div class="text-2xl font-bold text-blue-600">{{ syncResult.totalMpPayments }}</div>
        </div>
      </div>

      <!-- Erros -->
      <div v-if="syncResult.errorDetails && syncResult.errorDetails.length > 0">
        <h3 class="text-md font-semibold mb-3 text-red-600">Detalhes dos Erros</h3>
        <div class="bg-red-50 p-4 rounded">
          <table class="w-full text-sm">
            <thead class="bg-red-100">
              <tr>
                <th class="px-4 py-2 text-left">Payment ID</th>
                <th class="px-4 py-2 text-left">Erro</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(err, index) in syncResult.errorDetails" :key="index" class="border-b">
                <td class="px-4 py-2 font-mono text-xs">{{ err.paymentId }}</td>
                <td class="px-4 py-2 text-red-600">{{ err.error }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else-if="syncResult.synced > 0" class="text-green-600 font-semibold mb-4">
        ✓ Sincronização concluída com sucesso!
      </div>

      <button
        @click="$router.push('/admin/pedidos')"
        class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Ir para Pedidos
      </button>
    </div>
  </div>
</template>
