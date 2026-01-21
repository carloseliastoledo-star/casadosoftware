<template>
  <section class="bg-gray-50 min-h-screen py-12">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Meus pedidos</h1>
          <p class="text-sm text-gray-600 mt-1">Veja suas compras e licenças.</p>
        </div>

        <button
          @click="logout"
          class="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        >
          Sair
        </button>
      </div>

      <div v-if="pending" class="text-sm text-gray-600">Carregando...</div>
      <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>

      <div v-else class="space-y-4">
        <div v-if="orders.length === 0" class="bg-white rounded-2xl border border-gray-100 p-6">
          <div class="text-gray-700">Você ainda não tem pedidos.</div>
        </div>

        <div v-for="o in orders" :key="o.id" class="bg-white rounded-2xl border border-gray-100 p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="font-semibold text-gray-900">{{ o.produto?.nome }}</div>
              <div class="text-xs text-gray-500 mt-1">Pedido: #{{ o.numero }}</div>
              <div class="text-xs text-gray-400 font-mono">{{ o.id }}</div>
              <div class="text-xs text-gray-500">Status: {{ o.status }}</div>
            </div>
            <div class="text-xs text-gray-500">
              {{ formatDate(o.criadoEm) }}
            </div>
          </div>

          <div class="mt-4">
            <div class="text-sm font-semibold text-gray-800 mb-2">Licenças</div>

            <div v-if="!o.licencas || o.licencas.length === 0" class="text-sm text-gray-600">
              Nenhuma licença vinculada ainda.
            </div>

            <div v-else class="space-y-2">
              <div v-for="l in o.licencas" :key="l.id" class="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <div class="text-xs text-gray-500">{{ l.status }}</div>
                <div class="font-mono text-sm text-gray-900 break-all">{{ l.chave }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['customer'] })

type OrderDto = {
  id: string
  numero: number
  status: string
  criadoEm: string
  pagoEm: string | null
  produto: { id: string; nome: string; slug: string } | null
  licencas: { id: string; chave: string; status: string }[]
}

const { data, pending, error, refresh } = await useFetch<{ ok: true; orders: OrderDto[] }>('/api/customer/orders', {
  server: false
})

const orders = computed(() => data.value?.orders || [])

function formatDate(input: string) {
  try {
    return new Date(input).toLocaleString('pt-BR')
  } catch {
    return input
  }
}

async function logout() {
  await $fetch('/api/customer/auth/logout', { method: 'POST' })
  await refresh()
  await navigateTo('/minha-conta/login')
}
</script>
