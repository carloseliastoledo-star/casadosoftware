<template>
  <section class="bg-gray-50 min-h-screen">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <div class="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900">Vendor Dashboard</h1>
          <p class="mt-2 text-gray-600">
            Enter your vendor email and token to manage products and view your sales and commissions.
          </p>
        </div>
      </div>

      <div class="mt-8 rounded-2xl border bg-white p-6">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-900">Vendor email</label>
            <input
              v-model="email"
              type="email"
              autocomplete="off"
              class="mt-2 w-full rounded-lg border px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="vendor@example.com"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-900">Token</label>
            <input
              v-model="token"
              type="text"
              autocomplete="off"
              class="mt-2 w-full rounded-lg border px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="paste your token"
            />
          </div>
        </div>
        <div class="mt-4 flex gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 transition"
            :disabled="loading"
            @click="load"
          >
            {{ loading ? 'Loading…' : 'Load dashboard' }}
          </button>
        </div>

        <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
      </div>

      <div v-if="data" class="mt-8 space-y-6">
        <div class="grid md:grid-cols-4 gap-5">
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">Sales</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ data.totals.salesCount }}</div>
          </div>
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">Vendor earnings</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ money(data.totals.vendorAmount) }}</div>
          </div>
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">Platform fee</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ money(data.totals.platformFee) }}</div>
          </div>
          <div class="rounded-2xl border bg-white p-6">
            <div class="text-sm font-semibold text-gray-600">Payout balance</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ money(data.totals.payoutBalance) }}</div>
          </div>
        </div>

        <div class="rounded-2xl border bg-white p-6">
          <h2 class="text-lg font-bold text-gray-900">Create product</h2>
          <div class="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-900">Name</label>
              <input v-model="productForm.nome" class="mt-2 w-full rounded-lg border px-4 py-3" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-900">Slug</label>
              <input v-model="productForm.slug" class="mt-2 w-full rounded-lg border px-4 py-3" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-900">Price</label>
              <input v-model="productForm.preco" type="number" step="0.01" class="mt-2 w-full rounded-lg border px-4 py-3" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-900">Image URL (optional)</label>
              <input v-model="productForm.imagem" class="mt-2 w-full rounded-lg border px-4 py-3" />
            </div>
          </div>
          <div class="mt-4 flex gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 transition"
              :disabled="creating"
              @click="createProduct"
            >
              {{ creating ? 'Creating…' : 'Create' }}
            </button>
          </div>
          <p v-if="createError" class="mt-3 text-sm text-red-600">{{ createError }}</p>
          <p v-if="createOk" class="mt-3 text-sm text-emerald-700">Product created.</p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="rounded-2xl border bg-white p-6">
            <h2 class="text-lg font-bold text-gray-900">Recent sales</h2>
            <div class="mt-4 space-y-2">
              <div v-for="o in sales" :key="o.id" class="rounded-xl border p-4">
                <div class="font-semibold text-gray-900">{{ o.produto?.nome }}</div>
                <div class="text-sm text-gray-600">Order {{ o.id }} · {{ o.pagoEm ? formatDate(o.pagoEm) : '' }}</div>
                <div class="mt-1 font-semibold">{{ money(o.totalAmount) }} {{ String(o.currency || '').toUpperCase() }}</div>
              </div>
              <div v-if="!sales.length" class="text-sm text-gray-500">No sales yet.</div>
            </div>
          </div>

          <div class="rounded-2xl border bg-white p-6">
            <h2 class="text-lg font-bold text-gray-900">Recent commissions</h2>
            <div class="mt-4 space-y-2">
              <div v-for="c in commissions" :key="c.id" class="rounded-xl border p-4">
                <div class="font-semibold text-gray-900">Order {{ c.orderId }}</div>
                <div class="mt-1 text-sm text-gray-700">Vendor: {{ money(c.vendorAmount) }}</div>
                <div class="text-sm text-gray-700">Affiliate: {{ money(c.affiliateAmount) }}</div>
                <div class="text-sm text-gray-700">Platform fee: {{ money(c.platformFee) }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ formatDate(c.createdAt) }}</div>
              </div>
              <div v-if="!commissions.length" class="text-sm text-gray-500">No commissions yet.</div>
            </div>
          </div>
        </div>

        <div class="mt-10 text-xs text-gray-500">
          This dashboard is a summary view. Payouts are handled manually in this MVP.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()

const email = ref(String((route.query as any)?.email || '').trim().toLowerCase())
const token = ref(String((route.query as any)?.token || '').trim())

const loading = ref(false)
const error = ref('')
const data = ref<any>(null)

const sales = ref<any[]>([])
const commissions = ref<any[]>([])

const creating = ref(false)
const createError = ref('')
const createOk = ref(false)

const productForm = reactive({
  nome: '',
  slug: '',
  preco: 0,
  imagem: ''
})

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
  sales.value = []
  commissions.value = []

  const e = String(email.value || '').trim().toLowerCase()
  const t = String(token.value || '').trim()
  if (!e || !e.includes('@')) {
    error.value = 'Please enter your vendor email.'
    return
  }
  if (!t) {
    error.value = 'Please enter your token.'
    return
  }

  loading.value = true
  try {
    data.value = await $fetch('/api/vendor/dashboard', { method: 'GET', query: { email: e, token: t } })
    const s: any = await $fetch('/api/vendor/sales', { method: 'GET', query: { email: e, token: t } })
    const c: any = await $fetch('/api/vendor/commissions', { method: 'GET', query: { email: e, token: t } })
    sales.value = Array.isArray(s?.orders) ? s.orders : []
    commissions.value = Array.isArray(c?.commissions) ? c.commissions : []
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load dashboard.'
  } finally {
    loading.value = false
  }
}

async function createProduct() {
  createError.value = ''
  createOk.value = false

  const e = String(email.value || '').trim().toLowerCase()
  const t = String(token.value || '').trim()
  if (!e || !e.includes('@') || !t) {
    createError.value = 'Load dashboard first.'
    return
  }

  creating.value = true
  try {
    await $fetch('/api/vendor/products', {
      method: 'POST',
      query: { email: e, token: t },
      body: {
        nome: productForm.nome,
        slug: productForm.slug,
        preco: Number(productForm.preco),
        imagem: productForm.imagem || null
      }
    })

    createOk.value = true
    productForm.nome = ''
    productForm.slug = ''
    productForm.preco = 0
    productForm.imagem = ''

    await load()
  } catch (err: any) {
    createError.value = err?.data?.statusMessage || err?.message || 'Failed to create product.'
  } finally {
    creating.value = false
  }
}

watch(
  () => [route.query.email, route.query.token],
  ([e, t]) => {
    const nextEmail = String(e || '').trim().toLowerCase()
    const nextToken = String(t || '').trim()
    if (nextEmail && nextEmail !== email.value) email.value = nextEmail
    if (nextToken && nextToken !== token.value) token.value = nextToken
  }
)
</script>
