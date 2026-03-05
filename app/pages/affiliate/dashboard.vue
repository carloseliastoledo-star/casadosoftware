<template>
  <section class="bg-gray-50 min-h-screen">
    <div class="max-w-5xl mx-auto px-6 py-12">
      <div class="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900">Affiliate Dashboard</h1>
          <p class="mt-2 text-gray-600">
            Enter your affiliate code to view performance and commissions.
          </p>
        </div>
      </div>

      <div class="mt-8 rounded-2xl border bg-white p-6">
        <label class="block text-sm font-semibold text-gray-900">Affiliate code</label>
        <div class="mt-2 flex flex-col sm:flex-row gap-3">
          <input
            v-model="code"
            type="text"
            autocomplete="off"
            class="w-full rounded-lg border px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Your code (e.g., ABC123)"
          />
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 transition"
            :disabled="loading"
            @click="load"
          >
            {{ loading ? 'Loading…' : 'View dashboard' }}
          </button>
        </div>

        <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
      </div>

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

        <div class="grid md:grid-cols-2 gap-5">
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">Total Sales</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ data.totals.totalSales }}</div>
          </div>
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">Total Commission</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ money(data.totals.totalCommission) }}</div>
          </div>
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">Pending Commission</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ money(data.totals.pendingCommission) }}</div>
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
      </div>

      <div class="mt-10 text-xs text-gray-500">
        This dashboard is a summary view. If you need payout assistance, contact support.
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()

const code = ref(String((route.query as any)?.code || '').trim())
const loading = ref(false)
const error = ref('')
const data = ref<any>(null)

function money(value: unknown) {
  const n = Number(value ?? 0)
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
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

  const c = String(code.value || '').trim()
  if (!c) {
    error.value = 'Please enter your affiliate code.'
    return
  }

  loading.value = true
  try {
    data.value = await $fetch('/api/affiliate/dashboard', {
      method: 'GET',
      query: { code: c }
    })
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load dashboard.'
  } finally {
    loading.value = false
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

watch(
  () => route.query.code,
  (v) => {
    const next = String(v || '').trim()
    if (next && next !== code.value) code.value = next
  }
)
</script>
