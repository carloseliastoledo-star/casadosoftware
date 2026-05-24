<script setup>
definePageMeta({
  layout: 'admin',
  ssr: true
})

const filters = ref({
  status: '',
  paymentStatus: '',
  customerEmail: '',
  licenseEmail: '',
  dateFrom: '',
  dateTo: ''
})

const loading = ref(false)
const licenseSends = ref([])

async function fetchLicenseSends() {
  loading.value = true
  try {
    const queryParams = new URLSearchParams()
    if (filters.value.status) queryParams.append('status', filters.value.status)
    if (filters.value.paymentStatus) queryParams.append('paymentStatus', filters.value.paymentStatus)
    if (filters.value.customerEmail) queryParams.append('customerEmail', filters.value.customerEmail)
    if (filters.value.licenseEmail) queryParams.append('licenseEmail', filters.value.licenseEmail)
    if (filters.value.dateFrom) queryParams.append('dateFrom', filters.value.dateFrom)
    if (filters.value.dateTo) queryParams.append('dateTo', filters.value.dateTo)

    const response = await $fetch(`/api/admin/testes-office-365?${queryParams.toString()}`)
    licenseSends.value = response.licenseSends || []
  } catch (error) {
    console.error('Error fetching license sends:', error)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.value = {
    status: '',
    paymentStatus: '',
    customerEmail: '',
    licenseEmail: '',
    dateFrom: '',
    dateTo: ''
  }
  fetchLicenseSends()
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('pt-BR')
}

function getStatusBadge(status) {
  const badges = {
    SENT: { class: 'bg-green-100 text-green-800', label: 'Enviado' },
    PENDING_STOCK: { class: 'bg-yellow-100 text-yellow-800', label: 'Aguardando Estoque' },
    ERROR: { class: 'bg-red-100 text-red-800', label: 'Erro' }
  }
  return badges[status] || { class: 'bg-gray-100 text-gray-800', label: status }
}

function getPaymentStatusBadge(status) {
  const badges = {
    PENDING: { class: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
    PAID: { class: 'bg-green-100 text-green-800', label: 'Pago' },
    CANCELLED: { class: 'bg-red-100 text-red-800', label: 'Cancelado' }
  }
  return badges[status] || { class: 'bg-gray-100 text-gray-800', label: status }
}

// Carregar dados ao montar
onMounted(() => {
  fetchLicenseSends()
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded shadow p-6">
      <h1 class="text-2xl font-bold">Testes Office 365 - Licenças Enviadas</h1>
      <p class="mt-2 text-gray-600">Controle das licenças enviadas para testes</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded shadow p-6">
      <h2 class="font-bold mb-4">Filtros</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="filters.status" class="w-full border border-gray-300 rounded px-3 py-2">
            <option value="">Todos</option>
            <option value="SENT">Enviado</option>
            <option value="PENDING_STOCK">Aguardando Estoque</option>
            <option value="ERROR">Erro</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status Pagamento</label>
          <select v-model="filters.paymentStatus" class="w-full border border-gray-300 rounded px-3 py-2">
            <option value="">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="PAID">Pago</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">E-mail Cliente</label>
          <input v-model="filters.customerEmail" type="email" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="cliente@email.com">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">E-mail Licença</label>
          <input v-model="filters.licenseEmail" type="email" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="licenca@email.com">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data De</label>
          <input v-model="filters.dateFrom" type="date" class="w-full border border-gray-300 rounded px-3 py-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Até</label>
          <input v-model="filters.dateTo" type="date" class="w-full border border-gray-300 rounded px-3 py-2">
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button @click="fetchLicenseSends" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Filtrar
        </button>
        <button @click="resetFilters" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded">
          Limpar
        </button>
      </div>
    </div>

    <!-- Tabela -->
    <div class="bg-white rounded shadow">
      <div class="px-6 py-4 border-b">
        <h2 class="font-bold">Licenças Enviadas</h2>
      </div>

      <div class="p-6">
        <div v-if="loading" class="text-gray-500 text-sm">
          Carregando...
        </div>

        <div v-else-if="!licenseSends.length" class="text-gray-500 text-sm">
          Nenhuma licença enviada encontrada.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 border-b">
                <th class="py-3 px-2">Cliente</th>
                <th class="py-3 px-2">E-mail Cliente</th>
                <th class="py-3 px-2">E-mail Licença</th>
                <th class="py-3 px-2">Data Envio</th>
                <th class="py-3 px-2">Status</th>
                <th class="py-3 px-2">Pagamento</th>
                <th class="py-3 px-2">Origem</th>
                <th class="py-3 px-2">Pedido</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in licenseSends" :key="item.id" class="border-b hover:bg-gray-50">
                <td class="py-3 px-2 font-medium">{{ item.customerName }}</td>
                <td class="py-3 px-2 text-gray-600">{{ item.customerEmail }}</td>
                <td class="py-3 px-2 text-gray-600">{{ item.licenseEmail || '-' }}</td>
                <td class="py-3 px-2">{{ formatDate(item.sentAt) }}</td>
                <td class="py-3 px-2">
                  <span :class="getStatusBadge(item.status).class" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getStatusBadge(item.status).label }}
                  </span>
                </td>
                <td class="py-3 px-2">
                  <span :class="getPaymentStatusBadge(item.paymentStatus).class" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getPaymentStatusBadge(item.paymentStatus).label }}
                  </span>
                </td>
                <td class="py-3 px-2 text-gray-600">{{ item.source }}</td>
                <td class="py-3 px-2 text-gray-600">{{ item.orderId || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
