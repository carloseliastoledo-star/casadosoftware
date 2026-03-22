<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data, pending, error, refresh } = await useFetch('/api/admin/partner-applications', {
  server: true
})

const items = computed(() => (data.value as any)?.items || [])

const approveState = ref<Record<number, { refCode: string; commissionRate: string; loading: boolean; error: string; inviteUrl: string }>>({})

function getRowState(it: any) {
  const id = Number(it?.id)
  if (!Number.isFinite(id)) return null
  if (!approveState.value[id]) {
    const emailPrefix = String(it?.email || '').split('@')[0] || ''
    const suggested = emailPrefix
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '')
    approveState.value[id] = {
      refCode: suggested,
      commissionRate: '0.25',
      loading: false,
      error: '',
      inviteUrl: ''
    }
  }
  return approveState.value[id]
}

async function approve(it: any) {
  const st = getRowState(it)
  if (!st) return

  const id = Number(it?.id)
  if (!Number.isFinite(id)) return

  st.loading = true
  st.error = ''
  st.inviteUrl = ''

  try {
    const res: any = await $fetch(`/api/admin/partner-applications/${id}/approve`, {
      method: 'POST',
      body: {
        refCode: st.refCode,
        commissionRate: Number(st.commissionRate)
      }
    })
    st.inviteUrl = String(res?.inviteUrl || '')
  } catch (err: any) {
    st.error = err?.data?.statusMessage || err?.message || 'Falha ao aprovar'
  } finally {
    st.loading = false
  }
}

async function copyInvite(url: string) {
  const u = String(url || '').trim()
  if (!u) return
  try {
    await navigator.clipboard.writeText(u)
  } catch {
    // ignore
  }
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString('pt-BR')
  } catch {
    return d
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4 flex-wrap mb-6">
      <h1 class="text-2xl font-bold">Inscrições (Afiliados)</h1>
      <button type="button" class="bg-gray-900 text-white px-4 py-2 rounded" @click="refresh">Atualizar</button>
    </div>

    <div v-if="pending" class="text-gray-600">Carregando...</div>
    <div v-else-if="error" class="text-red-600">Erro ao carregar inscrições.</div>

    <div v-else>
      <div v-if="items.length === 0" class="text-gray-500">Nenhuma inscrição encontrada.</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full bg-white rounded shadow text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-left">Data</th>
              <th class="p-3 text-left">Nome</th>
              <th class="p-3 text-left">Email</th>
              <th class="p-3 text-left">País</th>
              <th class="p-3 text-left">Website</th>
              <th class="p-3 text-left">Social</th>
              <th class="p-3 text-left">Tráfego</th>
              <th class="p-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in items" :key="it.id" class="border-t">
              <td class="p-3 text-gray-600 whitespace-nowrap">{{ formatDate(it.createdAt) }}</td>
              <td class="p-3 font-medium">{{ it.name }}</td>
              <td class="p-3 text-gray-700">{{ it.email }}</td>
              <td class="p-3 text-gray-700">{{ it.country }}</td>
              <td class="p-3 text-gray-700">
                <a v-if="it.website" :href="it.website" target="_blank" class="text-blue-600 hover:underline">{{ it.website }}</a>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="p-3 text-gray-700">
                <span v-if="it.social">{{ it.social }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="p-3 text-gray-700">
                <span v-if="it.monthlyTraffic">{{ it.monthlyTraffic }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>

              <td class="p-3">
                <div class="min-w-[260px] space-y-2">
                  <div v-if="it.approved" class="space-y-1">
                    <span class="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      ✓ Aprovado
                    </span>
                    <div class="text-xs text-gray-600">
                      <span class="font-medium">Ref:</span> <span class="font-mono">{{ it.affiliateRefCode }}</span>
                      <span class="ml-2 font-medium">Comissão:</span> {{ ((it.affiliateCommissionRate || 0) * 100).toFixed(0) }}%
                    </div>
                  </div>

                  <template v-else>
                    <div class="grid grid-cols-2 gap-2">
                      <input
                        :value="getRowState(it)?.refCode || ''"
                        class="border rounded px-2 py-1 text-xs font-mono"
                        placeholder="refCode"
                        :disabled="Boolean(getRowState(it)?.loading)"
                        @input="(e) => { const st = getRowState(it); if (!st) return; st.refCode = String((e.target as HTMLInputElement).value || '') }"
                      />
                      <input
                        :value="getRowState(it)?.commissionRate || ''"
                        class="border rounded px-2 py-1 text-xs font-mono"
                        placeholder="0.25"
                        :disabled="Boolean(getRowState(it)?.loading)"
                        @input="(e) => { const st = getRowState(it); if (!st) return; st.commissionRate = String((e.target as HTMLInputElement).value || '') }"
                      />
                    </div>

                    <button
                      type="button"
                      class="bg-emerald-600 text-white px-3 py-2 rounded text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60"
                      :disabled="getRowState(it)?.loading"
                      @click="approve(it)"
                    >
                      {{ getRowState(it)?.loading ? 'Aprovando…' : 'Aprovar' }}
                    </button>

                    <div v-if="getRowState(it)?.error" class="text-xs text-red-600">{{ getRowState(it)?.error }}</div>

                    <div v-if="getRowState(it)?.inviteUrl" class="flex items-center gap-2">
                      <input class="w-full border rounded px-2 py-1 text-xs font-mono" :value="getRowState(it)?.inviteUrl" readonly />
                      <button type="button" class="border px-2 py-1 rounded text-xs" @click="copyInvite(String(getRowState(it)?.inviteUrl || ''))">
                        Copiar
                      </button>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 bg-gray-50 border rounded p-4">
        <div class="text-sm font-semibold text-gray-900">Observação</div>
        <div class="text-sm text-gray-700 mt-1">
          Caso o SMTP não esteja configurado, o e-mail pode não ser enviado, mas as inscrições continuam sendo registradas aqui.
        </div>
      </div>
    </div>
  </div>
</template>
