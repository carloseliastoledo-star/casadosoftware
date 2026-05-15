<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Origem das Vendas</h1>
      <p class="text-gray-600">Dashboard de canais de aquisição de clientes</p>
    </div>

    <!-- Filtros de Data -->
    <div class="bg-white rounded shadow p-4 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">De</label>
          <input type="date" v-model="dateFrom" class="border rounded-lg p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Até</label>
          <input type="date" v-model="dateTo" class="border rounded-lg p-2" />
        </div>
        <div class="flex gap-2">
          <button
            v-for="period in quickPeriods"
            :key="period.key"
            class="px-3 py-2 text-sm rounded-lg border"
            :class="activeQuick === period.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'"
            @click="applyQuickPeriod(period.key)"
          >
            {{ period.label }}
          </button>
        </div>
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          @click="loadData"
          :disabled="pending"
        >
          {{ pending ? 'Carregando...' : 'Atualizar' }}
        </button>
      </div>
    </div>

    <!-- Loading e Error -->
    <div v-if="pending" class="text-center py-8">
      <div class="text-gray-500">Carregando dados...</div>
    </div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
      Erro ao carregar: {{ error }}
    </div>

    <!-- Resumo Geral -->
    <div v-else-if="data" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded shadow p-4">
        <div class="text-sm text-gray-500">Total de Vendas</div>
        <div class="text-2xl font-bold">{{ data.summary.totalOrders }}</div>
      </div>
      <div class="bg-white rounded shadow p-4">
        <div class="text-sm text-gray-500">Receita Total</div>
        <div class="text-2xl font-bold text-green-600">
          R$ {{ formatCurrency(data.summary.totalRevenue) }}
        </div>
      </div>
      <div class="bg-white rounded shadow p-4">
        <div class="text-sm text-gray-500">Ticket Médio</div>
        <div class="text-2xl font-bold">
          R$ {{ formatCurrency(data.summary.averageTicket) }}
        </div>
      </div>
      <div class="bg-white rounded shadow p-4">
        <div class="text-sm text-gray-500">Canais Ativos</div>
        <div class="text-2xl font-bold">{{ data.channels.length }}</div>
      </div>
    </div>

    <!-- Tabela de Canais -->
    <div v-if="data?.channels?.length" class="bg-white rounded shadow overflow-hidden mb-6">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left">Canal</th>
            <th class="px-4 py-3 text-right">Vendas</th>
            <th class="px-4 py-3 text-right">% do Total</th>
            <th class="px-4 py-3 text-right">Receita</th>
            <th class="px-4 py-3 text-right">Ticket Médio</th>
            <th class="px-4 py-3 text-left">Campanha Principal</th>
            <th class="px-4 py-3 text-left">Última Venda</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="channel in data.channels" :key="channel.channel" class="border-t hover:bg-gray-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <span
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: channel.color }"
                ></span>
                <span class="font-medium">{{ channel.label }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-right font-medium">
              {{ channel.orderCount }}
            </td>
            <td class="px-4 py-3 text-right text-gray-600">
              {{ ((channel.orderCount / data.summary.totalOrders) * 100).toFixed(1) }}%
            </td>
            <td class="px-4 py-3 text-right font-medium text-green-600">
              R$ {{ formatCurrency(channel.totalRevenue) }}
            </td>
            <td class="px-4 py-3 text-right">
              R$ {{ formatCurrency(channel.averageTicket) }}
            </td>
            <td class="px-4 py-3 text-left">
              <span v-if="channel.mainCampaign" class="text-xs bg-gray-100 px-2 py-1 rounded">
                {{ channel.mainCampaign }}
              </span>
              <span v-else class="text-gray-400 text-xs">-</span>
            </td>
            <td class="px-4 py-3 text-left text-gray-600">
              {{ channel.lastSaleAt ? formatDate(channel.lastSaleAt) : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Gráfico Simples de Barras -->
    <div v-if="data?.channels?.length" class="bg-white rounded shadow p-6 mb-6">
      <h3 class="font-semibold mb-4">Receita por Canal</h3>
      <div class="space-y-3">
        <div v-for="channel in data.channels" :key="channel.channel" class="flex items-center gap-4">
          <div class="w-32 text-sm truncate" :title="channel.label">{{ channel.label }}</div>
          <div class="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full"
              :style="{
                width: `${(channel.totalRevenue / data.summary.totalRevenue) * 100}%`,
                backgroundColor: channel.color
              }"
            ></div>
          </div>
          <div class="w-24 text-right text-sm font-medium">
            R$ {{ formatCurrency(channel.totalRevenue) }}
          </div>
          <div class="w-16 text-right text-xs text-gray-500">
            {{ ((channel.totalRevenue / data.summary.totalRevenue) * 100).toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Pedidos Recentes -->
    <div v-if="data?.orders?.length" class="bg-white rounded shadow overflow-hidden">
      <div class="px-4 py-3 border-b bg-gray-50">
        <h3 class="font-semibold">Últimas Vendas por Canal</h3>
      </div>
      <table class="w-full text-xs">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-2 text-left">Pedido</th>
            <th class="px-3 py-2 text-left">Data</th>
            <th class="px-3 py-2 text-left">Cliente</th>
            <th class="px-3 py-2 text-left">Produto</th>
            <th class="px-3 py-2 text-left">Canal</th>
            <th class="px-3 py-2 text-left">Campanha</th>
            <th class="px-3 py-2 text-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in recentOrders" :key="order.id" class="border-t hover:bg-gray-50">
            <td class="px-3 py-2 font-mono">{{ order.id.slice(-8) }}</td>
            <td class="px-3 py-2">{{ formatDate(order.pagoEm) }}</td>
            <td class="px-3 py-2 truncate max-w-32">{{ order.customerEmail }}</td>
            <td class="px-3 py-2 truncate max-w-40">{{ order.productName }}</td>
            <td class="px-3 py-2">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-medium"
                :style="{ backgroundColor: order.color + '20', color: order.color }"
              >
                {{ order.channelLabel }}
              </span>
            </td>
            <td class="px-3 py-2 text-gray-500">{{ order.campaign || '-' }}</td>
            <td class="px-3 py-2 text-right font-medium">
              R$ {{ formatCurrency(order.totalAmount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  middleware: ['admin']
})

interface ChannelData {
  channel: string
  label: string
  color: string
  orderCount: number
  totalRevenue: number
  averageTicket: number
  lastSaleAt: string | null
  mainCampaign: string | null
  topCampaigns: { name: string; count: number }[]
}

interface OrderData {
  id: string
  totalAmount: number
  pagoEm: string
  customerEmail: string
  productName: string
  channel: string
  channelLabel: string
  campaign: string | null
  color: string
}

interface ReportData {
  ok: boolean
  summary: {
    totalOrders: number
    totalRevenue: number
    averageTicket: number
    dateRange: { from: string; to: string } | null
  }
  channels: ChannelData[]
  orders: OrderData[]
}

const quickPeriods = [
  { key: 'today', label: 'Hoje' },
  { key: 'yesterday', label: 'Ontem' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: 'all', label: 'Tudo' }
]

const dateFrom = ref(todayStr())
const dateTo = ref(todayStr())
const activeQuick = ref('today')

const { data, pending, error, refresh } = await useFetch<ReportData>('/api/admin/reports/traffic-sources', {
  query: computed(() => ({
    dateFrom: dateFrom.value,
    dateTo: dateTo.value
  })),
  server: false
})

const recentOrders = computed(() => {
  return (data.value?.orders || []).slice(0, 20)
})

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoStr(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function applyQuickPeriod(key: string) {
  activeQuick.value = key
  const today = todayStr()

  switch (key) {
    case 'today':
      dateFrom.value = today
      dateTo.value = today
      break
    case 'yesterday':
      const y = daysAgoStr(1)
      dateFrom.value = y
      dateTo.value = y
      break
    case '7d':
      dateFrom.value = daysAgoStr(6)
      dateTo.value = today
      break
    case '30d':
      dateFrom.value = daysAgoStr(29)
      dateTo.value = today
      break
    case 'all':
      dateFrom.value = ''
      dateTo.value = ''
      break
  }
}

function loadData() {
  refresh()
}

function formatCurrency(value: number): string {
  if (!value && value !== 0) return '-'
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
