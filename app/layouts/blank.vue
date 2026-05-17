<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="bg-white border-b">
      <div class="max-w-6xl mx-auto px-6">
        <div class="h-16 md:h-20 flex items-center justify-between gap-6">
          <NuxtLink to="/" class="flex items-center gap-3 min-w-0">
            <picture>
              <source v-if="logoWebpPath" :srcset="logoWebpPath" type="image/webp" />
              <img :src="logoPath" :alt="siteName" class="h-10 md:h-12 w-auto" />
            </picture>
            <span class="text-sm md:text-base font-extrabold tracking-tight text-gray-900 truncate">
              {{ siteName }}
            </span>
          </NuxtLink>

          <NuxtLink to="/" class="text-sm font-semibold text-gray-700 hover:text-blue-600">
            {{ backToSiteLabel }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="bg-white border-t mt-16">
      <div class="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10 text-sm text-gray-600">
        <div>
          <div class="flex items-center gap-3">
            <picture>
              <source v-if="logoWebpPath" :srcset="logoWebpPath" type="image/webp" />
              <img :src="logoPath" :alt="siteName" class="h-10 w-auto" />
            </picture>
            <div class="font-extrabold text-gray-900">{{ siteName }}</div>
          </div>
          <p class="mt-3">
            {{ footerDescText }}
          </p>
        </div>

        <div>
          <h3 class="font-semibold text-gray-800 mb-3">{{ pagesTitleLabel }}</h3>
          <ul class="space-y-2">
            <li v-if="!isIntl"><NuxtLink to="/atendimento-e-politicas" class="hover:text-blue-600">Atendimento e Políticas</NuxtLink></li>
            <li><NuxtLink :to="digitalDeliveryPath" class="hover:text-blue-600">{{ digitalDeliveryLabel }}</NuxtLink></li>
            <li><NuxtLink :to="refundPolicyPath" class="hover:text-blue-600">{{ refundPolicyLabel }}</NuxtLink></li>
            <li><NuxtLink :to="privacyPolicyPath" class="hover:text-blue-600">{{ privacyLabel }}</NuxtLink></li>
            <li><NuxtLink :to="termsOfUsePath" class="hover:text-blue-600">{{ termsLabel }}</NuxtLink></li>
            <li><NuxtLink :to="aboutUsPath" class="hover:text-blue-600">{{ contactLabel }}</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h3 class="font-semibold text-gray-800 mb-3">{{ contactHeadingLabel }}</h3>
          <p v-if="supportEmail" class="font-medium text-gray-800">
            {{ supportEmail }}
          </p>
          <p v-if="whatsappHref" class="mt-2 font-medium text-gray-800">
            <a class="hover:underline" :href="whatsappHref" target="_blank" rel="noopener noreferrer">
              WhatsApp: {{ whatsappLabel }}
            </a>
          </p>
          <p v-if="!isIntl && companyCnpj" class="mt-3 text-xs text-gray-500">
            {{ companyLegalName }} — CNPJ {{ companyCnpj }}
          </p>
        </div>
      </div>

      <div class="text-center text-xs text-gray-500 py-4 border-t">
        © {{ new Date().getFullYear() }} {{ siteName }} — {{ rightsReservedLabel }}
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { siteName, logoPath, supportEmail, whatsappNumber, companyLegalName, companyCnpj } = useSiteBranding()
const intl = useIntlContext()

// Read _pluginLang synchronously — same state key set by i18n.ts plugin
const _pluginLang = useState<string | null>('ld_server_lang', () => null)

// Read host synchronously in setup (useRequestURL/useRequestEvent only reliable synchronously)
const _ssrHost = (() => {
  if (import.meta.server) {
    try {
      const url = useRequestURL()
      if (url?.host) return String(url.host).toLowerCase()
    } catch { /* ignore */ }
    try {
      const event = useRequestEvent()
      const raw = String(event?.node?.req?.headers?.['x-forwarded-host'] || event?.node?.req?.headers?.host || '')
      return String(raw.split(',')[0]?.trim() || '').toLowerCase()
    } catch { /* ignore */ }
  }
  return ''
})()

const isEn = computed(() => {
  // SSR: plugin lang is most reliable (has real host header from i18n.ts)
  if (import.meta.server) {
    if (_pluginLang.value === 'en') return true
    if (_pluginLang.value && _pluginLang.value !== 'en') return false
    // Fallback: use synchronously-captured host
    const h = _ssrHost
    if (h.includes('gvgmall') || h.includes('globalsoftware') || h.endsWith('.store')) return true
    if (h.endsWith('.com.br') || h.includes('localhost') || h.includes('127.0.0.1') || h.includes('.vercel.app')) return false
    return h.length > 0
  }
  // Client: use window.location.host directly
  const h = String(window.location.host || '').toLowerCase()
  if (h.includes('gvgmall') || h.includes('globalsoftware') || h.endsWith('.store')) return true
  if (h.endsWith('.com.br') || h.includes('localhost') || h.includes('127.0.0.1') || h.includes('.vercel.app')) return false
  return h.length > 0
})

const isIntl = isEn

const aboutUsPath = computed(() => (isEn.value ? '/about-us' : '/quem-somos'))
const digitalDeliveryPath = computed(() => (isEn.value ? '/digital-delivery' : '/entrega-digital'))
const refundPolicyPath = computed(() => (isEn.value ? '/refund-policy' : '/reembolso'))
const privacyPolicyPath = computed(() => (isEn.value ? '/privacy-policy' : '/privacidade'))
const termsOfUsePath = computed(() => (isEn.value ? '/terms-of-use' : '/termos'))

const backToSiteLabel = computed(() => (isEn.value ? 'Back to the website' : 'Voltar para o site'))
const pagesTitleLabel = computed(() => (isEn.value ? 'Pages' : 'Páginas'))
const digitalDeliveryLabel = computed(() => (isEn.value ? 'Digital delivery' : 'Entrega Digital'))
const refundPolicyLabel = computed(() => (isEn.value ? 'Refund policy' : 'Política de Reembolso'))
const privacyLabel = computed(() => (isEn.value ? 'Privacy policy' : 'Privacidade'))
const termsLabel = computed(() => (isEn.value ? 'Terms of use' : 'Termos'))
const contactLabel = computed(() => (isEn.value ? 'Contact' : 'Contato'))
const contactHeadingLabel = computed(() => (isEn.value ? 'Contact' : 'Contato'))
const footerDescText = computed(() => (isEn.value ? 'Institutional content and customer support information.' : 'Conteúdo institucional e informações de atendimento.'))
const rightsReservedLabel = computed(() => (isEn.value ? 'All rights reserved.' : 'Todos os direitos reservados.'))

const logoWebpPath = computed(() => {
  const raw = String(logoPath || '').trim()
  if (!raw) return ''
  if (raw.endsWith('.webp')) return raw
  return ''
})

const whatsappLabel = computed(() => {
  const raw = String(whatsappNumber || '').trim()
  if (!raw) return ''
  return raw
})

const whatsappHref = computed(() => {
  const raw = String(whatsappNumber || '').trim()
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return `https://wa.me/${digits}`
})
</script>
