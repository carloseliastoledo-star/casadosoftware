<template>
  <div class="bg-gray-50 min-h-screen">
    <section class="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-700 to-indigo-900 text-white">
      <div
        class="absolute inset-0 opacity-30"
        style="background-image: radial-gradient(circle at 25% 20%, rgba(255,255,255,.35), transparent 45%), radial-gradient(circle at 80% 30%, rgba(255,255,255,.20), transparent 40%);"
      />

      <div class="relative max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div class="text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm font-semibold">
            <span aria-hidden="true">✔</span>
            Ativação legal e suporte
          </div>
          <h1 class="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight">
            Licenças Digitais Originais
          </h1>
          <p class="mt-4 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Ativação legal, suporte ao cliente e transparência.
          </p>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto py-16 px-6">
      <div class="text-center">
        <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">Por que escolher a Licenças Digitais?</h2>
        <p class="mt-3 text-gray-600 max-w-2xl mx-auto">
          Benefícios pensados para dar confiança na compra e clareza no processo de ativação.
        </p>
      </div>

      <div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-black">✓</div>
          <h3 class="mt-4 font-extrabold text-gray-900">Ativação Oficial</h3>
          <p class="text-sm text-gray-600 mt-2">Validação nos servidores do fabricante.</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl">⚡</div>
          <h3 class="mt-4 font-extrabold text-gray-900">Entrega Digital</h3>
          <p class="text-sm text-gray-600 mt-2">Envio rápido por e-mail após confirmação.</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl">💬</div>
          <h3 class="mt-4 font-extrabold text-gray-900">Suporte</h3>
          <p class="text-sm text-gray-600 mt-2">Auxílio na instalação e ativação.</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl">🧾</div>
          <h3 class="mt-4 font-extrabold text-gray-900">Transparência</h3>
          <p class="text-sm text-gray-600 mt-2">Informações claras e nota fiscal.</p>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto py-16 px-6">
      <div class="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-3xl p-8 md:p-10 shadow-sm">
        <div class="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 class="text-2xl md:text-3xl font-extrabold">Confiança antes, durante e depois da compra</h2>
            <p class="mt-3 text-white/80">
              Veja nossas páginas institucionais, políticas e canais de atendimento.
            </p>

            <div class="mt-6 flex flex-wrap gap-3">
              <NuxtLink
                :to="digitalDeliveryPath"
                class="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
              >
                Entrega Digital
              </NuxtLink>
              <NuxtLink
                :to="refundPolicyPath"
                class="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
              >
                Política de Reembolso
              </NuxtLink>
              <NuxtLink
                :to="privacyPolicyPath"
                class="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
              >
                Privacidade
              </NuxtLink>
              <NuxtLink
                :to="termsOfUsePath"
                class="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
              >
                Termos
              </NuxtLink>
            </div>
          </div>

          <div class="bg-white/10 border border-white/15 rounded-2xl p-6">
            <div class="text-sm font-semibold text-white/80">Atendimento</div>
            <div class="mt-2 text-lg font-extrabold">Precisa de ajuda?</div>
            <p class="mt-2 text-white/80 text-sm">
              Fale com nosso suporte para tirar dúvidas sobre ativação e instalação.
            </p>
            <NuxtLink
              to="/atendimento-e-politicas"
              class="mt-5 inline-flex items-center justify-center w-full bg-white text-gray-900 font-extrabold px-5 py-3 rounded-xl hover:bg-gray-100 transition"
            >
              Ver Contato
            </NuxtLink>
            <div class="mt-4 text-xs text-white/70">ELETROKEYS LTDA — CNPJ 44.694.356/0001-48</div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto pb-16 px-6">
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
        <div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">Pronto para escolher sua licença?</h2>
          <p class="mt-3 text-gray-600">Veja a lista completa de licenças disponíveis.</p>
        </div>
      </div>
    </section>

    <section class="max-w-4xl mx-auto py-16 px-4">
      <h2 class="text-2xl font-bold text-center mb-8">
        Perguntas Frequentes
      </h2>

      <div class="space-y-4">
        <div class="bg-gray-100 p-6 rounded-xl">
          <h3 class="font-semibold">O que é uma licença digital?</h3>
          <p class="text-gray-700 mt-2">
            É um código único utilizado para ativar o software online,
            validando nos servidores oficiais do fabricante.
          </p>
        </div>

        <div class="bg-gray-100 p-6 rounded-xl">
          <h3 class="font-semibold">Como funciona a ativação?</h3>
          <p class="text-gray-700 mt-2">
            Após inserir a chave nas configurações do sistema,
            o software valida automaticamente pela internet.
          </p>
        </div>

        <div class="bg-gray-100 p-6 rounded-xl">
          <h3 class="font-semibold">Recebo suporte?</h3>
          <p class="text-gray-700 mt-2">
            Sim, há canais de atendimento para auxiliar na instalação e ativação.
          </p>
        </div>

        <div class="bg-gray-100 p-6 rounded-xl">
          <h3 class="font-semibold">É emitida documentação fiscal?</h3>
          <p class="text-gray-700 mt-2">
            Sim, a empresa mantém transparência e documentação conforme legislação.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' as any })

const intl = useIntlContext()
const digitalDeliveryPath = computed(() => (intl.language.value === 'en' ? '/digital-delivery' : '/entrega-digital'))
const refundPolicyPath = computed(() => (intl.language.value === 'en' ? '/refund-policy' : '/reembolso'))
const privacyPolicyPath = computed(() => (intl.language.value === 'en' ? '/privacy-policy' : '/privacidade'))
const termsOfUsePath = computed(() => (intl.language.value === 'en' ? '/terms-of-use' : '/termos'))

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "ELETROKEYS LTDA",
        "url": "https://www.mercadosoftwares.com.br",
        "logo": "https://www.mercadosoftwares.com.br/logo-mercadosoftwares.png",
        "description": "Empresa especializada em licenças digitais e suporte ao cliente.",
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+55 11 91069-1485",
            "contactType": "customer support",
            "areaServed": "BR",
            "availableLanguage": "Portuguese"
          }
        ],
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Rua Almerinda Barão Passoni Vila Aparecida",
          "addressLocality": "Itupeva",
          "addressRegion": "SP",
          "postalCode": "13298808",
          "addressCountry": "BR"
        },
        "sameAs": [
          "https://www.instagram.com/suaempresa",
          "https://www.facebook.com/suaempresa"
        ]
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "O que é uma licença digital?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "É um código único utilizado para ativar o software diretamente online, validando nos servidores oficiais do fabricante."
            }
          },
          {
            "@type": "Question",
            "name": "Como funciona a ativação?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Após inserir a chave nas configurações do sistema, o software valida automaticamente pela internet."
            }
          },
          {
            "@type": "Question",
            "name": "Recebo suporte?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sim, há canais de atendimento disponíveis para auxiliar na instalação e ativação."
            }
          },
          {
            "@type": "Question",
            "name": "É emitida documentação fiscal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sim, a empresa mantém transparência e documentação conforme legislação vigente."
            }
          }
        ]
      })
    }
  ]
})
</script>
