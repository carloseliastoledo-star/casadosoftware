<template>
  <div class="space-y-6">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Saques de Afiliados</h1>
        <p class="text-sm text-gray-600 mt-1">Gerencie solicitações de saque.</p>
      </div>
      <button class="border px-4 py-2 rounded" @click="refresh">Atualizar</button>
    </div>

    <div class="bg-white rounded shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600">
          <tr>
            <th class="p-3 text-left">Data</th>
            <th class="p-3 text-left">Afiliado</th>
            <th class="p-3 text-left">Valor</th>
            <th class="p-3 text-left">Status</th>
            <th class="p-3 text-left">Obs</th>
            <th class="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in payouts" :key="p.id" class="border-t">
            <td class="p-3">{{ formatDate(p.createdAt) }}</td>
            <td class="p-3">
              <div class="font-medium">{{ p.affiliate?.name }}</div>
              <div class="text-xs text-gray-500">{{ p.affiliate?.email }}</div>
              <div class="text-xs text-gray-500 font-mono">{{ p.affiliate?.refCode }}</div>
            </td>
            <td class="p-3">{{ money(p.amount) }}</td>
            <td class="p-3">
              <span class="font-mono text-xs">{{ p.status }}</span>
            </td>
            <td class="p-3 text-xs text-gray-700">{{ p.note || '-' }}</td>
            <td class="p-3">
              <div class="flex items-center gap-2">
                <button class="border px-3 py-1 rounded" @click="setStatus(p.id, 'approved')">Aprovar</button>
                <button class="border px-3 py-1 rounded" @click="setStatus(p.id, 'paid')">Pago</button>
                <button class="border px-3 py-1 rounded" @click="setStatus(p.id, 'rejected')">Rejeitar</button>
              </div>
            </td>
          </tr>
          <tr v-if="!payouts.length" class="border-t">
            <td class="p-3 text-gray-500" colspan="6">Nenhum saque.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type PayoutRow = {
  id: number
  amount: number
  status: string
  note: string | null
  createdAt: string
  affiliate: { id: number; name: string; email: string; refCode: string }
}

const { data, refresh } = await useFetch<{ ok: true; payouts: PayoutRow[] }>('/api/admin/affiliate-payouts', { server: false })
const payouts = computed(() => data.value?.payouts || [])

function money(v: unknown) {
  const n = Number(v ?? 0)
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
  } catch {
    return String(n)
  }
}

function formatDate(value: unknown) {
  const d = new Date(String(value || ''))
  if (Number.isNaN(d.getTime())) return ''
  try {
    return new Intl.DateTimeFormat('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
  } catch {
    return d.toISOString()
  }
}

async function setStatus(id: number, status: string) {
  if (!confirm(`Alterar status para ${status}?`)) return
  await $fetch(`/api/admin/affiliate-payouts/${id}`, {
    method: 'PATCH',
    body: { status }
  })
  await refresh()
}
</script>
