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
            Voltar para o site
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
            Conteúdo institucional e informações de atendimento.
          </p>
        </div>

        <div>
          <h3 class="font-semibold text-gray-800 mb-3">Páginas</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/atendimento-e-politicas" class="hover:text-blue-600">Atendimento e Políticas</NuxtLink></li>
            <li><NuxtLink to="/entrega-digital" class="hover:text-blue-600">Entrega Digital</NuxtLink></li>
            <li><NuxtLink to="/reembolso" class="hover:text-blue-600">Política de Reembolso</NuxtLink></li>
            <li><NuxtLink to="/privacidade" class="hover:text-blue-600">Privacidade</NuxtLink></li>
            <li><NuxtLink to="/termos" class="hover:text-blue-600">Termos</NuxtLink></li>
            <li><NuxtLink to="/quem-somos" class="hover:text-blue-600">Contato</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h3 class="font-semibold text-gray-800 mb-3">Contato</h3>
          <p v-if="supportEmail" class="font-medium text-gray-800">
            {{ supportEmail }}
          </p>
          <p v-if="whatsappHref" class="mt-2 font-medium text-gray-800">
            <a class="hover:underline" :href="whatsappHref" target="_blank" rel="noopener noreferrer">
              WhatsApp: {{ whatsappLabel }}
            </a>
          </p>
          <p class="mt-3 text-xs text-gray-500">
            {{ companyLegalName }} — CNPJ {{ companyCnpj }}
          </p>
        </div>
      </div>

      <div class="text-center text-xs text-gray-500 py-4 border-t">
        © {{ new Date().getFullYear() }} {{ siteName }} — Todos os direitos reservados.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { siteName, logoPath, supportEmail, whatsappNumber, companyLegalName, companyCnpj } = useSiteBranding()

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
