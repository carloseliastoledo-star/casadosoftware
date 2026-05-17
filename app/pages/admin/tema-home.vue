<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Tema da Home</h1>
        <p class="text-sm text-gray-600 mt-1">Edite os textos, cores e seções da página inicial.</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="px-4 py-2 rounded-lg border text-sm"
          :disabled="saving"
          @click="restoreDefault"
        >
          Restaurar padrão
        </button>
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Salvando...' : 'Salvar tema' }}
        </button>
      </div>
    </div>

    <div v-if="loadError" class="text-red-600 text-sm mb-4">{{ loadError }}</div>
    <div v-if="saveError" class="text-red-600 text-sm mb-4">{{ saveError }}</div>
    <div v-if="saveSuccess" class="text-green-700 text-sm mb-4">Tema salvo com sucesso.</div>

    <div v-if="loading" class="text-gray-500 text-sm">Carregando...</div>

    <div v-else class="space-y-4">
      <!-- Abas -->
      <div class="flex flex-wrap gap-2 border-b pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition"
          :class="activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50 text-gray-700'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Hero -->
      <div v-if="activeTab === 'hero'" class="bg-white rounded shadow p-6 space-y-4">
        <h2 class="font-semibold text-gray-800">Hero</h2>
        <FieldText label="Badge" v-model="form.hero.badge" :max="100" />
        <FieldText label="Título" v-model="form.hero.title" :max="200" />
        <FieldText label="Subtítulo" v-model="form.hero.subtitle" :max="500" />
        <FieldText label="CTA Primário — Texto" v-model="form.hero.primaryCtaLabel" :max="200" />
        <FieldUrl label="CTA Primário — URL" v-model="form.hero.primaryCtaUrl" />
        <FieldText label="CTA Secundário — Texto" v-model="form.hero.secondaryCtaLabel" :max="200" />
        <FieldUrl label="CTA Secundário — URL" v-model="form.hero.secondaryCtaUrl" />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Imagem do Hero (URL ou upload)</label>
          <div class="flex items-center gap-2">
            <input
              type="text"
              v-model="form.hero.imageUrl"
              maxlength="500"
              placeholder="/caminho ou https://..."
              class="flex-1 border rounded-lg p-2.5 text-sm font-mono"
            />
            <label class="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm">
              <span>{{ heroImageUploading ? 'Enviando...' : '📤 Upload' }}</span>
              <input ref="heroImageInput" type="file" accept="image/*" class="hidden" @change="uploadHeroImage" :disabled="heroImageUploading" />
            </label>
          </div>
          <div v-if="heroImageUploadError" class="text-xs text-red-500 mt-1">{{ heroImageUploadError }}</div>
          <div v-if="form.hero.imageUrl" class="mt-2">
            <img :src="form.hero.imageUrl" alt="Hero preview" class="max-h-40 rounded border object-contain" />
          </div>
        </div>
      </div>

      <!-- Cores -->
      <div v-if="activeTab === 'colors'" class="bg-white rounded shadow p-6 space-y-4">
        <h2 class="font-semibold text-gray-800">Cores</h2>
        <p class="text-xs text-gray-500">Formato obrigatório: <span class="font-mono">#RRGGBB</span></p>
        <FieldColor label="Primária" v-model="form.colors.primary" />
        <FieldColor label="Secundária" v-model="form.colors.secondary" />
        <FieldColor label="Destaque (Accent)" v-model="form.colors.accent" />
        <FieldColor label="Fundo (Background)" v-model="form.colors.background" />
        <FieldColor label="Superfície (Surface)" v-model="form.colors.surface" />
        <FieldColor label="Texto" v-model="form.colors.text" />
        <FieldColor label="Texto secundário (Muted)" v-model="form.colors.mutedText" />
      </div>

      <!-- Seções -->
      <div v-if="activeTab === 'sections'" class="bg-white rounded shadow p-6 space-y-4">
        <h2 class="font-semibold text-gray-800">Seções visíveis</h2>
        <FieldToggle label="Hero" v-model="form.sections.hero" />
        <FieldToggle label="Benefícios" v-model="form.sections.benefits" />
        <FieldToggle label="Produtos" v-model="form.sections.products" />
        <FieldToggle label="Passos (Como funciona)" v-model="form.sections.steps" />
        <FieldToggle label="FAQ" v-model="form.sections.faq" />
        <FieldToggle label="CTA" v-model="form.sections.cta" />
      </div>

      <!-- Benefícios -->
      <div v-if="activeTab === 'benefits'" class="bg-white rounded shadow p-6 space-y-6">
        <h2 class="font-semibold text-gray-800">Benefícios</h2>
        <div
          v-for="(b, i) in form.benefits"
          :key="i"
          class="border rounded-lg p-4 space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-sm text-gray-700">Benefício {{ i + 1 }}</span>
            <FieldToggle label="Ativo" v-model="b.enabled" />
          </div>
          <FieldText label="Ícone (shield, zap, headphones...)" v-model="b.icon" :max="32" />
          <FieldText label="Título" v-model="b.title" :max="200" />
          <FieldText label="Descrição" v-model="b.body" :max="500" />
        </div>
        <button
          v-if="form.benefits.length < 10"
          type="button"
          class="text-sm text-blue-600 hover:underline"
          @click="addBenefit"
        >
          + Adicionar benefício
        </button>
      </div>

      <!-- Produtos -->
      <div v-if="activeTab === 'products'" class="bg-white rounded shadow p-6 space-y-4">
        <h2 class="font-semibold text-gray-800">Produtos em destaque</h2>
        <FieldToggle label="Ativo" v-model="form.products.enabled" />
        <FieldText label="Título da seção" v-model="form.products.title" :max="200" />
        <FieldText label="Subtítulo" v-model="form.products.subtitle" :max="500" />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Slugs dos produtos (um por linha)</label>
          <textarea
            v-model="productSlugsText"
            rows="6"
            class="w-full border rounded-lg p-3 font-mono text-xs"
            placeholder="ex: windows-11-pro&#10;office-365"
          />
          <p class="text-xs text-gray-400 mt-1">Máximo 20 slugs. Apenas letras, números e hífens.</p>
        </div>
      </div>

      <!-- Passos -->
      <div v-if="activeTab === 'steps'" class="bg-white rounded shadow p-6 space-y-6">
        <h2 class="font-semibold text-gray-800">Passos (Como funciona)</h2>
        <div
          v-for="(s, i) in form.steps"
          :key="i"
          class="border rounded-lg p-4 space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-sm text-gray-700">Passo {{ i + 1 }}</span>
            <FieldToggle label="Ativo" v-model="s.enabled" />
          </div>
          <FieldText label="Título" v-model="s.title" :max="200" />
          <FieldText label="Descrição" v-model="s.body" :max="500" />
        </div>
        <button
          v-if="form.steps.length < 10"
          type="button"
          class="text-sm text-blue-600 hover:underline"
          @click="addStep"
        >
          + Adicionar passo
        </button>
      </div>

      <!-- FAQ -->
      <div v-if="activeTab === 'faq'" class="bg-white rounded shadow p-6 space-y-6">
        <h2 class="font-semibold text-gray-800">FAQ</h2>
        <div
          v-for="(f, i) in form.faq"
          :key="i"
          class="border rounded-lg p-4 space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-sm text-gray-700">Pergunta {{ i + 1 }}</span>
            <div class="flex items-center gap-3">
              <FieldToggle label="Ativo" v-model="f.enabled" />
              <button
                type="button"
                class="text-xs text-red-500 hover:underline"
                @click="removeFaq(i)"
              >
                Remover
              </button>
            </div>
          </div>
          <FieldText label="Pergunta" v-model="f.question" :max="200" />
          <FieldText label="Resposta" v-model="f.answer" :max="500" />
        </div>
        <button
          v-if="form.faq.length < 20"
          type="button"
          class="text-sm text-blue-600 hover:underline"
          @click="addFaq"
        >
          + Adicionar pergunta
        </button>
      </div>

      <!-- CTA -->
      <div v-if="activeTab === 'cta'" class="bg-white rounded shadow p-6 space-y-4">
        <h2 class="font-semibold text-gray-800">CTA</h2>
        <FieldToggle label="Ativo" v-model="form.cta.enabled" />
        <FieldText label="Kicker (texto pequeno acima)" v-model="form.cta.kicker" :max="100" />
        <FieldText label="Título" v-model="form.cta.title" :max="200" />
        <FieldText label="Subtítulo" v-model="form.cta.subtitle" :max="500" />
        <FieldText label="Texto do botão" v-model="form.cta.buttonLabel" :max="200" />
        <FieldUrl label="URL do botão" v-model="form.cta.buttonUrl" />
      </div>

      <!-- SEO -->
      <div v-if="activeTab === 'seo'" class="bg-white rounded shadow p-6 space-y-4">
        <h2 class="font-semibold text-gray-800">SEO</h2>
        <FieldText label="Título SEO" v-model="form.seo.title" :max="200" />
        <FieldText label="Descrição SEO" v-model="form.seo.description" :max="500" />
        <FieldUrl label="OG Image URL" v-model="form.seo.ogImage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HomeTheme } from '~/types/homeTheme'

definePageMeta({ layout: 'admin', ssr: false })

// ── Componentes locais ────────────────────────────────────────────
const FieldText = defineComponent({
  props: { label: String, modelValue: String, max: { type: Number, default: 200 } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('div', [
      h('label', { class: 'block text-sm font-medium text-gray-700 mb-1' }, props.label),
      h('input', {
        type: 'text',
        maxlength: props.max,
        value: props.modelValue,
        class: 'w-full border rounded-lg p-2.5 text-sm',
        onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)
      })
    ])
  }
})

const FieldUrl = defineComponent({
  props: { label: String, modelValue: String },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isInvalid = computed(() => {
      const v = String(props.modelValue || '').trim()
      if (!v) return false
      return !v.startsWith('/') && !v.startsWith('https://')
    })
    return () => h('div', [
      h('label', { class: 'block text-sm font-medium text-gray-700 mb-1' }, props.label),
      h('input', {
        type: 'text',
        maxlength: 500,
        value: props.modelValue,
        class: `w-full border rounded-lg p-2.5 text-sm font-mono ${isInvalid.value ? 'border-red-400' : ''}`,
        placeholder: '/caminho ou https://...',
        onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)
      }),
      isInvalid.value ? h('p', { class: 'text-xs text-red-500 mt-1' }, 'URL deve começar com / ou https://') : null
    ])
  }
})

const FieldColor = defineComponent({
  props: { label: String, modelValue: String },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isInvalid = computed(() => {
      const v = String(props.modelValue || '')
      return v !== '' && !/^#[0-9A-Fa-f]{6}$/.test(v)
    })
    return () => h('div', { class: 'flex items-center gap-3' }, [
      h('input', {
        type: 'color',
        value: /^#[0-9A-Fa-f]{6}$/.test(String(props.modelValue || '')) ? props.modelValue : '#000000',
        class: 'h-9 w-12 rounded border cursor-pointer',
        onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)
      }),
      h('div', { class: 'flex-1' }, [
        h('label', { class: 'block text-sm font-medium text-gray-700 mb-1' }, props.label),
        h('input', {
          type: 'text',
          maxlength: 7,
          value: props.modelValue,
          class: `w-full border rounded-lg p-2 text-sm font-mono ${isInvalid.value ? 'border-red-400' : ''}`,
          placeholder: '#2563eb',
          onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)
        })
      ])
    ])
  }
})

const FieldToggle = defineComponent({
  props: { label: String, modelValue: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('label', { class: 'flex items-center gap-2 cursor-pointer' }, [
      h('input', {
        type: 'checkbox',
        checked: props.modelValue,
        class: 'h-4 w-4',
        onChange: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).checked)
      }),
      h('span', { class: 'text-sm text-gray-700' }, props.label)
    ])
  }
})

// ── Estado ────────────────────────────────────────────────────────
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const saveError = ref('')
const saveSuccess = ref(false)

const heroImageInput = ref<HTMLInputElement | null>(null)
const heroImageUploading = ref(false)
const heroImageUploadError = ref('')

async function uploadHeroImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  heroImageUploading.value = true
  heroImageUploadError.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res: any = await $fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (res?.url) form.hero.imageUrl = res.url
  } catch (err: any) {
    heroImageUploadError.value = err?.data?.statusMessage || 'Erro ao enviar imagem'
  } finally {
    heroImageUploading.value = false
    if (heroImageInput.value) heroImageInput.value.value = ''
  }
}

const tabs = [
  { key: 'hero', label: 'Hero' },
  { key: 'colors', label: 'Cores' },
  { key: 'sections', label: 'Seções' },
  { key: 'benefits', label: 'Benefícios' },
  { key: 'products', label: 'Produtos' },
  { key: 'steps', label: 'Passos' },
  { key: 'faq', label: 'FAQ' },
  { key: 'cta', label: 'CTA' },
  { key: 'seo', label: 'SEO' }
]

const activeTab = ref('hero')

function emptyTheme(): HomeTheme {
  return {
    schemaVersion: 1,
    colors: { primary: '#2563eb', secondary: '#0f172a', accent: '#22c55e', background: '#f8fafc', surface: '#ffffff', text: '#111827', mutedText: '#64748b' },
    sections: { hero: true, benefits: true, products: true, steps: true, faq: true, cta: true },
    hero: { badge: '', title: '', subtitle: '', primaryCtaLabel: '', primaryCtaUrl: '', secondaryCtaLabel: '', secondaryCtaUrl: '', imageUrl: '' },
    benefits: [],
    products: { enabled: true, title: '', subtitle: '', productSlugs: [] },
    steps: [],
    faq: [],
    cta: { enabled: true, kicker: '', title: '', subtitle: '', buttonLabel: '', buttonUrl: '' },
    seo: { title: '', description: '', ogImage: '' }
  }
}

const form = reactive<HomeTheme>(emptyTheme())

const productSlugsText = computed({
  get: () => form.products.productSlugs.join('\n'),
  set: (v: string) => {
    form.products.productSlugs = v
      .split('\n')
      .map((s) => s.trim().replace(/[^a-z0-9\-]/g, '').slice(0, 120))
      .filter(Boolean)
      .slice(0, 20)
  }
})

function applyTheme(theme: HomeTheme) {
  Object.assign(form.colors, theme.colors)
  Object.assign(form.sections, theme.sections)
  Object.assign(form.hero, theme.hero)
  form.benefits.splice(0, form.benefits.length, ...theme.benefits)
  Object.assign(form.products, { ...theme.products, productSlugs: [...theme.products.productSlugs] })
  form.steps.splice(0, form.steps.length, ...theme.steps)
  form.faq.splice(0, form.faq.length, ...theme.faq)
  Object.assign(form.cta, theme.cta)
  Object.assign(form.seo, theme.seo)
}

onMounted(async () => {
  loading.value = true
  loadError.value = ''
  try {
    const res = await $fetch<{ ok: boolean; theme: HomeTheme }>('/api/admin/home-theme')
    applyTheme(res.theme)
  } catch (err: any) {
    loadError.value = err?.data?.statusMessage || err?.message || 'Erro ao carregar tema'
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    await $fetch('/api/admin/home-theme', { method: 'PUT', body: { ...form, schemaVersion: 1 } })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || err?.message || 'Erro ao salvar tema'
  } finally {
    saving.value = false
  }
}

async function restoreDefault() {
  if (!confirm('Restaurar todos os campos para o padrão?')) return
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    await $fetch('/api/admin/home-theme', {
      method: 'PUT',
      body: buildDefaultTheme()
    })
    applyTheme(buildDefaultTheme())
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || err?.message || 'Erro ao restaurar padrão'
  } finally {
    saving.value = false
  }
}

function buildDefaultTheme(): HomeTheme {
  return {
    schemaVersion: 1,
    colors: { primary: '#2563eb', secondary: '#0f172a', accent: '#22c55e', background: '#f8fafc', surface: '#ffffff', text: '#111827', mutedText: '#64748b' },
    sections: { hero: true, benefits: true, products: true, steps: true, faq: true, cta: true },
    hero: { badge: 'Entrega imediata', title: 'Software original com entrega rápida', subtitle: 'Licenças digitais para Windows, Office e produtividade com suporte especializado.', primaryCtaLabel: 'Ver ofertas', primaryCtaUrl: '/produtos', secondaryCtaLabel: 'Falar no WhatsApp', secondaryCtaUrl: '/contato', imageUrl: '' },
    benefits: [
      { enabled: true, icon: 'shield', title: 'Compra segura', body: 'Atendimento profissional e entrega digital.' },
      { enabled: true, icon: 'zap', title: 'Entrega rápida', body: 'Receba sua licença e instruções logo após a confirmação.' },
      { enabled: true, icon: 'headphones', title: 'Suporte incluso', body: 'Ajuda para instalação e ativação.' }
    ],
    products: { enabled: true, title: 'Mais vendidos', subtitle: 'Produtos mais procurados da loja.', productSlugs: [] },
    steps: [
      { enabled: true, title: 'Escolha o produto', body: 'Selecione a licença ideal para você.' },
      { enabled: true, title: 'Faça o pagamento', body: 'Finalize pelo checkout seguro.' },
      { enabled: true, title: 'Receba por e-mail', body: 'Acesse as instruções de instalação e ativação.' }
    ],
    faq: [
      { enabled: true, question: 'A entrega é digital?', answer: 'Sim. O produto é enviado digitalmente com instruções de uso.' },
      { enabled: true, question: 'Tem suporte?', answer: 'Sim. O suporte auxilia no processo de instalação e ativação.' }
    ],
    cta: { enabled: true, kicker: 'Pronto para comprar?', title: 'Escolha sua licença e receba com rapidez', subtitle: 'Atendimento profissional antes e depois da compra.', buttonLabel: 'Comprar agora', buttonUrl: '/produtos' },
    seo: { title: 'Licenças digitais com entrega rápida', description: 'Compre licenças digitais para Windows, Office e produtividade com entrega rápida e suporte.', ogImage: '' }
  }
}

function addBenefit() {
  form.benefits.push({ enabled: true, icon: 'shield', title: '', body: '' })
}

function addStep() {
  form.steps.push({ enabled: true, title: '', body: '' })
}

function addFaq() {
  form.faq.push({ enabled: true, question: '', answer: '' })
}

function removeFaq(i: number) {
  form.faq.splice(i, 1)
}
</script>
