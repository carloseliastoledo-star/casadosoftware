<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const form = reactive({
  googleAnalyticsId: '',
  googleAdsConversionId: '',
  googleAdsConversionLabel: '',
  headHtml: '',
  bodyOpenHtml: '',
  bodyCloseHtml: '',
  homeBestSellerSlugs: '',
  homeVideoUrl: '',
  footerPolicyLinks: ''
})

const loading = ref(true)
const saving = ref(false)
const message = ref('')
const errorMsg = ref('')

onMounted(async () => {
  loading.value = true
  message.value = ''
  errorMsg.value = ''

  try {
    const res: any = await $fetch('/api/admin/settings')
    const s = res?.settings || {}
    form.googleAnalyticsId = s.googleAnalyticsId ?? ''
    form.googleAdsConversionId = s.googleAdsConversionId ?? ''
    form.googleAdsConversionLabel = s.googleAdsConversionLabel ?? ''
    form.headHtml = s.headHtml ?? ''
    form.bodyOpenHtml = s.bodyOpenHtml ?? ''
    form.bodyCloseHtml = s.bodyCloseHtml ?? ''
    form.homeBestSellerSlugs = s.homeBestSellerSlugs ?? ''
    form.homeVideoUrl = s.homeVideoUrl ?? ''
    form.footerPolicyLinks = s.footerPolicyLinks ?? ''
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Erro ao carregar configurações'
  } finally {
    loading.value = false
  }
})

async function salvar() {
  saving.value = true
  message.value = ''
  errorMsg.value = ''

  try {
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: {
        googleAnalyticsId: form.googleAnalyticsId,
        googleAdsConversionId: form.googleAdsConversionId,
        googleAdsConversionLabel: form.googleAdsConversionLabel,
        headHtml: form.headHtml,
        bodyOpenHtml: form.bodyOpenHtml,
        bodyCloseHtml: form.bodyCloseHtml,
        homeBestSellerSlugs: form.homeBestSellerSlugs,
        homeVideoUrl: form.homeVideoUrl,
        footerPolicyLinks: form.footerPolicyLinks
      }
    })
    message.value = 'Configurações salvas com sucesso.'
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Erro ao salvar configurações'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded shadow p-6">
      <h1 class="text-2xl font-bold">Configurações</h1>
      <p class="mt-2 text-gray-600">Google Ads</p>
    </div>

    <div v-if="loading" class="text-gray-500">Carregando...</div>

    <div v-else class="bg-white rounded shadow p-6 space-y-4 max-w-2xl">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID (GA4)</label>
        <input v-model="form.googleAnalyticsId" class="w-full border p-2 rounded" placeholder="Ex: G-XXXXXXXXXX" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Google Ads Conversion ID</label>
        <input v-model="form.googleAdsConversionId" class="w-full border p-2 rounded" placeholder="Ex: AW-123456789" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Google Ads Conversion Label</label>
        <input v-model="form.googleAdsConversionLabel" class="w-full border p-2 rounded" placeholder="Ex: AbCdEfGhIjkLmNoPqRsT" />
      </div>

      <div class="pt-4 border-t">
        <label class="block text-sm font-medium text-gray-700 mb-1">Código no &lt;head&gt; (HTML)</label>
        <textarea v-model="form.headHtml" class="w-full border p-2 rounded font-mono text-xs" rows="6" placeholder="Cole aqui scripts/meta/pixel..." />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Código no início do &lt;body&gt; (HTML)</label>
        <textarea v-model="form.bodyOpenHtml" class="w-full border p-2 rounded font-mono text-xs" rows="6" placeholder="Ex: Tag Manager (noscript)" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Código no final do &lt;body&gt; (HTML)</label>
        <textarea v-model="form.bodyCloseHtml" class="w-full border p-2 rounded font-mono text-xs" rows="6" placeholder="Cole aqui scripts que devem carregar no final" />
      </div>

      <div class="pt-4 border-t">
        <label class="block text-sm font-medium text-gray-700 mb-1">Home - Mais vendidos (slugs)</label>
        <textarea
          v-model="form.homeBestSellerSlugs"
          class="w-full border p-2 rounded font-mono text-xs"
          rows="4"
          placeholder="Opcional: informe os slugs dos produtos (um por linha ou separados por vírgula) para aparecerem na Home. Se vazio, o sistema calcula automaticamente pelos pedidos PAID."
        />
      </div>

      <div class="pt-4 border-t">
        <label class="block text-sm font-medium text-gray-700 mb-1">Home - Link do vídeo (YouTube)</label>
        <input
          v-model="form.homeVideoUrl"
          class="w-full border p-2 rounded"
          placeholder="Ex: https://www.youtube.com/watch?v=XXXXXXXXXXX"
        />
      </div>

      <div class="pt-4 border-t">
        <label class="block text-sm font-medium text-gray-700 mb-1">Rodapé - Links (CALL CENTER AND POLICY) (JSON)</label>
        <textarea
          v-model="form.footerPolicyLinks"
          class="w-full border p-2 rounded font-mono text-xs"
          rows="8"
          placeholder='Aceita JSON ou 1 por linha.

JSON:
[{"label":"Privacy Policy","to":"/privacidade"},{"label":"Terms of Service","to":"/termos"}]

Linhas:
Privacy Policy | /privacidade
Terms of Service | /termos'
        />
      </div>

      <div v-if="message" class="text-sm text-green-700">{{ message }}</div>
      <div v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</div>

      <button
        type="button"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-60"
        :disabled="saving"
        @click="salvar"
      >
        {{ saving ? 'Salvando...' : 'Salvar' }}
      </button>
    </div>
  </div>
</template>
