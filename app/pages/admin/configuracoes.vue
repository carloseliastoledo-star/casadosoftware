<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const form = reactive({
  googleAnalyticsId: '',
  googleAdsConversionId: '',
  googleAdsConversionLabel: '',
  metaPixelId: '',
  tiktokPixelId: '',
  headHtml: '',
  bodyOpenHtml: '',
  bodyCloseHtml: '',
  homeBestSellerSlugs: '',
  homeVideoUrl: '',
  footerPolicyLinks: '',
  pixGateway: 'mercadopago',
  cardGateway: 'mercadopago',
  orderBumpTitle: '',
  orderBumpDescription: '',
  orderBumpPrice: '19'
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
    form.metaPixelId = s.metaPixelId ?? ''
    form.tiktokPixelId = s.tiktokPixelId ?? ''
    form.headHtml = s.headHtml ?? ''
    form.bodyOpenHtml = s.bodyOpenHtml ?? ''
    form.bodyCloseHtml = s.bodyCloseHtml ?? ''
    form.homeBestSellerSlugs = s.homeBestSellerSlugs ?? ''
    form.homeVideoUrl = s.homeVideoUrl ?? ''
    form.footerPolicyLinks = s.footerPolicyLinks ?? ''
    form.pixGateway = s.pixGateway ?? 'mercadopago'
    form.cardGateway = s.cardGateway ?? 'mercadopago'
    form.orderBumpTitle = s.orderBumpTitle ?? ''
    form.orderBumpDescription = s.orderBumpDescription ?? ''
    form.orderBumpPrice = s.orderBumpPrice != null ? String(s.orderBumpPrice) : '19'
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
        metaPixelId: form.metaPixelId,
        tiktokPixelId: form.tiktokPixelId,
        headHtml: form.headHtml,
        bodyOpenHtml: form.bodyOpenHtml,
        bodyCloseHtml: form.bodyCloseHtml,
        homeBestSellerSlugs: form.homeBestSellerSlugs,
        homeVideoUrl: form.homeVideoUrl,
        footerPolicyLinks: form.footerPolicyLinks,
        pixGateway: form.pixGateway,
        cardGateway: form.cardGateway,
        orderBumpTitle: form.orderBumpTitle || null,
        orderBumpDescription: form.orderBumpDescription || null,
        orderBumpPrice: form.orderBumpPrice !== '' ? Number(form.orderBumpPrice) : null
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

    <div v-else class="space-y-6">

    <div class="bg-white rounded shadow p-6 max-w-2xl">
      <h2 class="text-lg font-semibold mb-4">Gateway PIX</h2>
      <p class="text-sm text-gray-500 mb-4">Selecione qual gateway será usado para pagamentos PIX no checkout.</p>
      <div class="flex gap-3">
        <button
          type="button"
          @click="form.pixGateway = 'mercadopago'"
          :class="form.pixGateway === 'mercadopago'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
          class="flex-1 border-2 rounded-xl py-4 px-4 font-semibold transition text-center"
        >
          <div class="text-base">Mercado Pago</div>
          <div class="text-xs font-normal mt-1 opacity-70">Padrão · aceito por padrão</div>
        </button>
        <button
          type="button"
          @click="form.pixGateway = 'pagarme'"
          :class="form.pixGateway === 'pagarme'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
          class="flex-1 border-2 rounded-xl py-4 px-4 font-semibold transition text-center"
        >
          <div class="text-base">Pagar.me</div>
          <div class="text-xs font-normal mt-1 opacity-70">Alternativo</div>
        </button>
        <button
          type="button"
          @click="form.pixGateway = 'pagbank'"
          :class="form.pixGateway === 'pagbank'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
          class="flex-1 border-2 rounded-xl py-4 px-4 font-semibold transition text-center"
        >
          <div class="text-base">PagBank</div>
          <div class="text-xs font-normal mt-1 opacity-70">PagSeguro</div>
        </button>
      </div>
      <div class="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <span>PIX ativo:</span>
        <span class="font-semibold text-gray-800">{{ form.pixGateway === 'pagarme' ? 'Pagar.me' : form.pixGateway === 'pagbank' ? 'PagBank' : 'Mercado Pago' }}</span>
      </div>

      <div class="mt-6 border-t pt-6">
        <div class="font-semibold mb-2">Gateway Cartão de Crédito</div>
        <p class="text-sm text-gray-500 mb-4">Selecione qual gateway será usado para pagamentos com cartão no checkout.</p>
        <div class="flex gap-3">
          <button
            type="button"
            @click="form.cardGateway = 'mercadopago'"
            :class="form.cardGateway === 'mercadopago'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
            class="flex-1 border-2 rounded-xl py-4 px-4 font-semibold transition text-center"
          >
            <div class="text-base">Mercado Pago</div>
            <div class="text-xs font-normal mt-1 opacity-70">SDK oficial · tokenização no browser</div>
          </button>
          <button
            type="button"
            @click="form.cardGateway = 'pagarme'"
            :class="form.cardGateway === 'pagarme'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
            class="flex-1 border-2 rounded-xl py-4 px-4 font-semibold transition text-center"
          >
            <div class="text-base">Pagar.me</div>
            <div class="text-xs font-normal mt-1 opacity-70">Formulário nativo · sem SDK</div>
          </button>
          <button
            type="button"
            @click="form.cardGateway = 'pagbank'"
            :class="form.cardGateway === 'pagbank'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
            class="flex-1 border-2 rounded-xl py-4 px-4 font-semibold transition text-center"
          >
            <div class="text-base">PagBank</div>
            <div class="text-xs font-normal mt-1 opacity-70">PagSeguro · sem SDK</div>
          </button>
        </div>
        <div class="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <span>Cartão ativo:</span>
          <span class="font-semibold text-gray-800">{{ form.cardGateway === 'pagarme' ? 'Pagar.me' : form.cardGateway === 'pagbank' ? 'PagBank' : 'Mercado Pago' }}</span>
        </div>
      </div>

      <div v-if="message" class="mt-3 text-sm text-green-700">{{ message }}</div>
      <div v-if="errorMsg" class="mt-3 text-sm text-red-600">{{ errorMsg }}</div>

      <button
        type="button"
        class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-60"
        :disabled="saving"
        @click="salvar"
      >
        {{ saving ? 'Salvando...' : 'Salvar Gateways' }}
      </button>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
      <h2 class="text-lg font-semibold mb-1">Order Bump</h2>
      <p class="text-sm text-gray-500 mb-4">Oferta adicional exibida no checkout do funil (Office 365 Pro).</p>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Título da oferta</label>
          <input
            v-model="form.orderBumpTitle"
            class="w-full border p-2 rounded"
            placeholder="Ex: Suporte premium de instalação"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            v-model="form.orderBumpDescription"
            class="w-full border p-2 rounded text-sm"
            rows="3"
            placeholder="Ex: Receba ajuda prioritária por WhatsApp em até 2h após a compra."
          />
        </div>
        <div class="max-w-xs">
          <label class="block text-sm font-medium text-gray-700 mb-1">Preço adicional (R$)</label>
          <input
            v-model="form.orderBumpPrice"
            type="number"
            min="0"
            step="0.01"
            class="w-full border p-2 rounded"
            placeholder="19.00"
          />
        </div>
      </div>

      <div v-if="message" class="mt-3 text-sm text-green-700">{{ message }}</div>
      <div v-if="errorMsg" class="mt-3 text-sm text-red-600">{{ errorMsg }}</div>

      <button
        type="button"
        class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-60"
        :disabled="saving"
        @click="salvar"
      >
        {{ saving ? 'Salvando...' : 'Salvar Order Bump' }}
      </button>
    </div>

    <div class="bg-white rounded shadow p-6 space-y-4 max-w-2xl">
      <h2 class="text-lg font-semibold">Tracking &amp; Pixels</h2>

      <div class="grid sm:grid-cols-2 gap-4 pb-4 border-b">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            📊 Meta Pixel ID
          </label>
          <input v-model="form.metaPixelId" class="w-full border p-2 rounded" placeholder="Ex: 1234567890123456" />
          <p class="text-xs text-gray-400 mt-1">Facebook / Instagram Ads</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            🎵 TikTok Pixel ID
          </label>
          <input v-model="form.tiktokPixelId" class="w-full border p-2 rounded" placeholder="Ex: CABCDE1234567890" />
          <p class="text-xs text-gray-400 mt-1">TikTok Ads Manager</p>
        </div>
      </div>

      <div class="grid sm:grid-cols-3 gap-4 pb-4 border-b">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            📊 Google Analytics ID (GA4)
          </label>
          <input v-model="form.googleAnalyticsId" class="w-full border p-2 rounded" placeholder="G-XXXXXXXXXX" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            💰 Google Ads Conversion ID
          </label>
          <input v-model="form.googleAdsConversionId" class="w-full border p-2 rounded" placeholder="AW-123456789" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            🏷️ Google Ads Label
          </label>
          <input v-model="form.googleAdsConversionLabel" class="w-full border p-2 rounded" placeholder="AbCdEfGhIjkL" />
        </div>
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
  </div>
</template>
