<template>
  <div class="space-y-6">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Afiliados</h1>
        <p class="text-sm text-gray-600 mt-1">Crie afiliados, gere convite e acompanhe métricas.</p>
      </div>
      <button class="bg-blue-600 text-white px-4 py-2 rounded" @click="refresh">Atualizar</button>
    </div>

    <div class="bg-white rounded shadow p-6 space-y-4">
      <div class="grid md:grid-cols-4 gap-3">
        <input v-model="form.name" class="border p-2 rounded" placeholder="Nome" />
        <input v-model="form.email" class="border p-2 rounded" placeholder="Email" />
        <input v-model="form.refCode" class="border p-2 rounded" placeholder="Código (ref)" />
        <input v-model="form.commissionRate" class="border p-2 rounded" placeholder="Taxa (ex: 0.25)" />
      </div>
      <div class="flex items-center gap-3">
        <button class="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60" :disabled="saving" @click="create">{{ saving ? 'Criando…' : 'Criar afiliado' }}</button>
        <span v-if="message" class="text-sm text-green-700">{{ message }}</span>
        <span v-if="error" class="text-sm text-red-700">{{ error }}</span>
      </div>
    </div>

    <div class="bg-white rounded shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600">
          <tr>
            <th class="p-3 text-left">Nome</th>
            <th class="p-3 text-left">Email</th>
            <th class="p-3 text-left">Código</th>
            <th class="p-3 text-left">Taxa</th>
            <th class="p-3 text-left">Ativo</th>
            <th class="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in affiliates" :key="a.id" class="border-t">
            <td class="p-3 font-medium">{{ a.name }}</td>
            <td class="p-3">{{ a.email }}</td>
            <td class="p-3 font-mono text-xs">{{ a.refCode }}</td>
            <td class="p-3">{{ Math.round(Number(a.commissionRate || 0) * 100) }}%</td>
            <td class="p-3">{{ a.isActive ? 'Sim' : 'Não' }}</td>
            <td class="p-3">
              <div class="flex items-center gap-3">
                <button class="text-blue-600 hover:underline" @click="invite(a.id)">Gerar convite</button>
                <button class="text-gray-700 hover:underline" @click="openDetails(a)">Detalhes</button>
              </div>
            </td>
          </tr>
          <tr v-if="!affiliates.length" class="border-t">
            <td class="p-3 text-gray-500" colspan="6">Nenhum afiliado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="inviteUrl" class="bg-white rounded shadow p-6">
      <div class="text-sm font-semibold">Link de convite</div>
      <div class="mt-2 flex flex-col md:flex-row gap-3">
        <input class="w-full border rounded p-2 font-mono text-xs" :value="inviteUrl" readonly />
        <button class="border px-4 py-2 rounded" @click="copyInvite">Copiar</button>
      </div>
    </div>

    <div v-if="details" class="bg-white rounded shadow p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div class="text-lg font-bold">{{ details.name }}</div>
        <button class="text-blue-600 hover:underline" @click="details = null">Fechar</button>
      </div>

      <div class="grid md:grid-cols-4 gap-4 text-sm">
        <div class="rounded border p-4">
          <div class="text-gray-500">Vendas</div>
          <div class="text-2xl font-bold">{{ details.stats.totalSales }}</div>
        </div>
        <div class="rounded border p-4">
          <div class="text-gray-500">Comissão total</div>
          <div class="text-2xl font-bold">R$ {{ details.stats.totalCommission }}</div>
        </div>
        <div class="rounded border p-4">
          <div class="text-gray-500">A receber (liberado)</div>
          <div class="text-2xl font-bold">R$ {{ details.stats.availableCommission }}</div>
        </div>
        <div class="rounded border p-4">
          <div class="text-gray-500">Pago</div>
          <div class="text-2xl font-bold">R$ {{ details.stats.paidCommission }}</div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button class="border px-4 py-2 rounded" @click="markPaid(details.id)">Marcar liberadas como pagas</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type AffiliateRow = {
  id: number
  name: string
  email: string
  refCode: string
  commissionRate: number
  isActive: boolean
}

const { data, refresh } = await useFetch<{ ok: true; affiliates: AffiliateRow[] }>('/api/admin/affiliates', { server: false })

const affiliates = computed(() => data.value?.affiliates || [])

const form = reactive({
  name: '',
  email: '',
  refCode: '',
  commissionRate: '0.25'
})

const saving = ref(false)
const error = ref('')
const message = ref('')

const inviteUrl = ref('')
const details = ref<any>(null)

async function create() {
  saving.value = true
  error.value = ''
  message.value = ''
  inviteUrl.value = ''
  try {
    await $fetch('/api/admin/affiliates', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        refCode: form.refCode,
        commissionRate: Number(form.commissionRate)
      }
    })
    form.name = ''
    form.email = ''
    form.refCode = ''
    form.commissionRate = '0.25'
    message.value = 'Afiliado criado.'
    await refresh()
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Falha ao criar'
  } finally {
    saving.value = false
  }
}

async function invite(id: number) {
  inviteUrl.value = ''
  try {
    const res: any = await $fetch(`/api/admin/affiliates/${id}/invite`, { method: 'POST' })
    inviteUrl.value = String(res?.inviteUrl || '')
  } catch (err: any) {
    alert(err?.data?.statusMessage || err?.message || 'Falha ao gerar convite')
  }
}

async function copyInvite() {
  try {
    await navigator.clipboard.writeText(inviteUrl.value)
  } catch {
    // ignore
  }
}

async function openDetails(a: AffiliateRow) {
  try {
    const res: any = await $fetch(`/api/admin/affiliates/${a.id}`)
    details.value = res?.affiliate || null
  } catch (err: any) {
    alert(err?.data?.statusMessage || err?.message || 'Falha ao carregar')
  }
}

async function markPaid(id: number) {
  if (!confirm('Marcar como pagas todas as comissões liberadas (após 7 dias) e ainda pendentes?')) return
  try {
    await $fetch(`/api/admin/affiliates/${id}/mark-paid`, { method: 'POST' })
    await openDetails({ id } as any)
  } catch (err: any) {
    alert(err?.data?.statusMessage || err?.message || 'Falha ao marcar como pago')
  }
}
</script>
