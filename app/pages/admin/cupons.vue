<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type CupomDto = {
  id: string
  code: string
  percent: number
  active: boolean
  startsAt: string | null
  expiresAt: string | null
  maxUses: number | null
  usedCount: number
  createdAt: string
}

const { data, refresh } = await useFetch<{ ok: true; cupons: CupomDto[] }>('/api/admin/cupons')
const cupons = computed(() => data.value?.cupons || [])

const form = reactive({
  code: '',
  percent: 10,
  startsAt: '',
  expiresAt: '',
  maxUses: '',
  active: true
})

const saving = ref(false)
const errorMsg = ref('')

async function criarCupom() {
  errorMsg.value = ''
  saving.value = true
  try {
    await $fetch('/api/admin/cupons', {
      method: 'POST',
      body: {
        code: form.code,
        percent: form.percent,
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
        maxUses: form.maxUses,
        active: form.active
      }
    })

    form.code = ''
    form.percent = 10
    form.startsAt = ''
    form.expiresAt = ''
    form.maxUses = ''
    form.active = true

    await refresh()
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Falha ao criar cupom'
  } finally {
    saving.value = false
  }
}

async function toggleActive(c: CupomDto) {
  await $fetch(`/api/admin/cupons/${c.id}`, {
    method: 'PATCH',
    body: { active: !c.active }
  })
  await refresh()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Cupons</h1>
        <div class="text-sm text-gray-600">Desconto por porcentagem (vale para Pix e Cartão).</div>
      </div>
    </div>

    <div class="bg-white rounded shadow p-6">
      <div class="grid md:grid-cols-6 gap-4 items-end">
        <div class="md:col-span-2">
          <label class="block text-sm font-semibold mb-1">Código</label>
          <input v-model="form.code" class="w-full border p-2 rounded" placeholder="EX: PROMO10" />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">%</label>
          <input v-model.number="form.percent" type="number" min="1" max="100" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Início</label>
          <input v-model="form.startsAt" type="datetime-local" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Expira</label>
          <input v-model="form.expiresAt" type="datetime-local" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Max usos</label>
          <input v-model="form.maxUses" class="w-full border p-2 rounded" placeholder="(opcional)" />
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.active" type="checkbox" />
          Ativo
        </label>

        <button
          class="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          :disabled="saving"
          @click="criarCupom"
        >
          {{ saving ? 'Salvando...' : 'Criar cupom' }}
        </button>
      </div>

      <div v-if="errorMsg" class="mt-2 text-sm text-red-600">{{ errorMsg }}</div>
    </div>

    <div class="bg-white rounded shadow">
      <table class="w-full text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-left">Código</th>
            <th class="p-3 text-left">%</th>
            <th class="p-3 text-left">Status</th>
            <th class="p-3 text-left">Usos</th>
            <th class="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in cupons" :key="c.id" class="border-t">
            <td class="p-3 font-semibold">{{ c.code }}</td>
            <td class="p-3">{{ c.percent }}%</td>
            <td class="p-3">
              <span
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                :class="c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
              >
                {{ c.active ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="p-3">{{ c.usedCount }}{{ c.maxUses ? ` / ${c.maxUses}` : '' }}</td>
            <td class="p-3">
              <button class="text-blue-600 hover:underline" @click="toggleActive(c)">
                {{ c.active ? 'Desativar' : 'Ativar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
