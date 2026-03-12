<template>
  <section class="bg-gray-50 min-h-screen">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <div class="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900">Painel do Afiliado</h1>
          <p class="mt-2 text-gray-600">Acompanhe vendas e comissões.</p>
        </div>
        <button
          type="button"
          class="text-sm text-red-600 hover:underline"
          @click="logout"
        >
          Sair
        </button>
      </div>

      <div v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</div>

      <div v-if="loading" class="mt-6 text-sm text-gray-600">Carregando…</div>

      <div v-if="data" class="mt-8 space-y-6">
        <div class="rounded-2xl border bg-white p-6">
          <div class="text-sm font-semibold text-gray-900">Your affiliate link</div>
          <div class="mt-2 flex flex-col sm:flex-row gap-3">
            <input
              :value="data.affiliateLink"
              readonly
              class="w-full rounded-lg border px-4 py-3 text-gray-900 bg-gray-50"
            />
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold px-6 py-3 transition"
              @click="copyLink"
            >
              Copy
            </button>
          </div>
          <p class="mt-2 text-sm text-gray-600">
            Share this link to track referrals: purchases made after a visitor arrives with <code>?ref=CODE</code> will be attributed to you.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-5">
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">Total Sales</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ data.totals.totalSales }}</div>
          </div>
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">Total Revenue</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ money(data.totals.totalRevenue) }}</div>
          </div>
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">Total Commission</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ money(data.totals.totalCommission) }}</div>
          </div>
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">A receber (liberado)</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ money(data.totals.availableCommission) }}</div>
          </div>
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">Bloqueado (garantia)</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ money(data.totals.lockedCommission) }}</div>
          </div>
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">Paid Commission</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ money(data.totals.paidCommission) }}</div>
          </div>
        </div>

        <div class="rounded-2xl border bg-gray-50 p-6">
          <div class="text-sm font-semibold text-gray-900">Commission settings</div>
          <div class="mt-3 grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div class="rounded-xl border bg-white p-4">
              <div class="font-semibold">Commission rate</div>
              <div class="mt-1">{{ Math.round(Number(data.affiliate.commissionRate || 0) * 100) }}%</div>
            </div>
            <div class="rounded-xl border bg-white p-4">
              <div class="font-semibold">Affiliate since</div>
              <div class="mt-1">{{ formatDate(data.affiliate.createdAt) }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border bg-white p-6 space-y-4">
          <div class="text-sm font-semibold text-gray-900">Solicitar saque</div>
          <div class="grid md:grid-cols-3 gap-3">
            <input v-model="payoutAmount" class="border rounded p-3" placeholder="Valor" />
            <input v-model="payoutNote" class="border rounded p-3 md:col-span-2" placeholder="Observação (opcional)" />
          </div>
          <button
            type="button"
            class="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 disabled:opacity-60"
            :disabled="payoutLoading"
            @click="requestPayout"
          >
            {{ payoutLoading ? 'Enviando…' : 'Solicitar' }}
          </button>
          <div v-if="payoutError" class="text-sm text-red-600">{{ payoutError }}</div>
          <div v-if="payoutOk" class="text-sm text-green-700">Solicitação enviada.</div>
        </div>

        <div class="rounded-2xl border bg-white p-6">
          <div class="text-sm font-semibold text-gray-900">Últimas vendas</div>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="text-gray-600">
                <tr>
                  <th class="text-left py-2">Data</th>
                  <th class="text-left py-2">Pedido</th>
                  <th class="text-left py-2">Produto</th>
                  <th class="text-left py-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in sales" :key="o.id" class="border-t">
                  <td class="py-2">{{ formatDate(o.pagoEm || o.criadoEm) }}</td>
                  <td class="py-2 font-mono text-xs">#{{ o.numero }}</td>
                  <td class="py-2">{{ o.produto?.nome }}</td>
                  <td class="py-2">{{ money(o.totalAmount) }}</td>
                </tr>
                <tr v-if="!sales.length" class="border-t">
                  <td class="py-3 text-gray-500" colspan="4">Nenhuma venda.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-2xl border bg-white p-6">
          <div class="text-sm font-semibold text-gray-900">Comissões</div>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="text-gray-600">
                <tr>
                  <th class="text-left py-2">Data</th>
                  <th class="text-left py-2">Pedido</th>
                  <th class="text-left py-2">Valor</th>
                  <th class="text-left py-2">Disponível em</th>
                  <th class="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in commissions" :key="c.id" class="border-t">
                  <td class="py-2">{{ formatDate(c.createdAt) }}</td>
                  <td class="py-2 font-mono text-xs">{{ c.order?.numero ? `#${c.order.numero}` : c.orderId }}</td>
                  <td class="py-2">{{ money(c.amount) }}</td>
                  <td class="py-2">{{ c.availableAt ? formatDate(c.availableAt) : '-' }}</td>
                  <td class="py-2">{{ c.status }}</td>
                </tr>
                <tr v-if="!commissions.length" class="border-t">
                  <td class="py-3 text-gray-500" colspan="5">Nenhuma comissão.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-2xl border bg-white p-6">
          <div class="text-sm font-semibold text-gray-900">Materiais de divulgação</div>

          <div v-if="materialsLoading" class="mt-4 text-sm text-gray-600">Carregando…</div>
          <div v-else-if="materialsError" class="mt-4 text-sm text-red-600">{{ materialsError }}</div>

          <div v-else class="mt-4">
            <div v-if="!materials.length" class="text-sm text-gray-500">Nenhum arquivo disponível.</div>
            <div v-else class="grid md:grid-cols-2 gap-3">
              <a
                v-for="m in materials"
                :key="m.id"
                class="rounded-xl border bg-gray-50 hover:bg-gray-100 px-4 py-3 transition"
                :href="`/api/affiliate/materials/${encodeURIComponent(m.id)}`"
                target="_blank"
                rel="noopener"
              >
                <div class="text-sm font-semibold text-gray-900 truncate">{{ m.name || m.fileName }}</div>
                <div class="mt-1 text-xs text-gray-600">{{ m.fileName }}</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const loading = ref(false)
const error = ref('')
const data = ref<any>(null)

const sales = ref<any[]>([])
const commissions = ref<any[]>([])

const materials = ref<any[]>([])
const materialsLoading = ref(false)
const materialsError = ref('')

const payoutAmount = ref('')
const payoutNote = ref('')
const payoutLoading = ref(false)
const payoutError = ref('')
const payoutOk = ref(false)

function money(value: unknown) {
  const n = Number(value ?? 0)
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
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).format(d)
  } catch {
    return d.toISOString()
  }
}

async function load() {
  error.value = ''
  data.value = null
  sales.value = []
  commissions.value = []

  materials.value = []
  materialsError.value = ''

  loading.value = true
  try {
    data.value = await $fetch('/api/affiliate/dashboard')
    materialsLoading.value = true

    const [salesRes, commRes, materialsRes] = await Promise.all([
      $fetch('/api/affiliate/sales'),
      $fetch('/api/affiliate/commissions'),
      $fetch('/api/affiliate/materials')
    ])
    sales.value = (salesRes as any)?.orders || []
    commissions.value = (commRes as any)?.commissions || []
    materials.value = (materialsRes as any)?.items || []
  } catch (err: any) {
    const msg = err?.data?.statusMessage || err?.message || 'Failed to load dashboard.'
    error.value = msg
    materialsError.value = msg
  } finally {
    materialsLoading.value = false
    loading.value = false
  }
}

async function requestPayout() {
  payoutError.value = ''
  payoutOk.value = false
  payoutLoading.value = true
  try {
    await $fetch('/api/affiliate/payouts', {
      method: 'POST',
      body: {
        amount: payoutAmount.value,
        note: payoutNote.value || null
      }
    })
    payoutOk.value = true
    payoutAmount.value = ''
    payoutNote.value = ''
  } catch (err: any) {
    payoutError.value = err?.data?.statusMessage || err?.message || 'Falha ao solicitar saque'
  } finally {
    payoutLoading.value = false
  }
}

async function logout() {
  try {
    await $fetch('/api/affiliate/auth/logout', { method: 'POST' })
  } finally {
    await navigateTo('/affiliate/login')
  }
}

async function copyLink() {
  try {
    const link = String((data.value as any)?.affiliateLink || '').trim()
    if (!link) return
    await navigator.clipboard.writeText(link)
  } catch {
    // ignore
  }
}

await load()
</script>
