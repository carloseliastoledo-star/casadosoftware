<template>
  <div class="bg-white min-h-screen">

    <!-- Hero -->
    <section class="bg-gradient-to-b from-blue-700 to-blue-900 text-white">
      <div class="max-w-4xl mx-auto px-6 py-16 text-center">
        <div class="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-semibold text-blue-100 mb-6">
          <span class="h-2 w-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
          {{ ui.badge }}
        </div>
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-5">
          {{ ui.h1 }}
        </h1>
        <p class="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
          {{ ui.sub }}
        </p>
        <a
          :href="productUrl"
          class="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-white font-extrabold text-lg px-10 py-4 rounded-2xl shadow-lg shadow-green-900/30 transition hover:scale-[1.02] active:scale-[0.99]"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
          </svg>
          {{ ui.cta1 }}
        </a>
        <p class="mt-4 text-sm text-blue-200">{{ ui.trust }}</p>
      </div>
    </section>

    <!-- Barra de prova social -->
    <section class="bg-gray-50 border-y">
      <div class="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left">
        <div class="flex -space-x-2">
          <div v-for="i in 5" :key="i" class="w-9 h-9 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white font-bold text-xs">
            {{ i }}
          </div>
        </div>
        <div>
          <div class="flex items-center gap-1 text-yellow-500 text-lg justify-center sm:justify-start">
            <span v-for="i in 5" :key="i">★</span>
          </div>
          <div class="text-sm font-semibold text-gray-800 mt-0.5">{{ ui.socialProof }}</div>
        </div>
      </div>
    </section>

    <!-- Benefícios principais -->
    <section class="max-w-5xl mx-auto px-6 py-16">
      <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 text-center mb-3">{{ ui.featuresTitle }}</h2>
      <p class="text-gray-500 text-center mb-10">{{ ui.featuresSub }}</p>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div v-for="f in features" :key="f.icon" class="rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition p-6 text-center">
          <div class="text-3xl mb-3">{{ f.icon }}</div>
          <div class="font-bold text-gray-900 mb-1">{{ f.title }}</div>
          <div class="text-sm text-gray-500 leading-relaxed">{{ f.desc }}</div>
        </div>
      </div>
    </section>

    <!-- CTA do meio -->
    <section class="bg-blue-600 py-12 text-center">
      <div class="max-w-2xl mx-auto px-6">
        <h2 class="text-2xl md:text-3xl font-extrabold text-white mb-4">{{ ui.midCtaTitle }}</h2>
        <a
          :href="productUrl"
          class="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-lg px-10 py-4 rounded-2xl transition shadow-lg"
        >
          {{ ui.cta2 }}
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </a>
      </div>
    </section>

    <!-- O que está incluído -->
    <section class="max-w-4xl mx-auto px-6 py-16">
      <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 text-center mb-10">{{ ui.includedTitle }}</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <div
          v-for="item in includedItems"
          :key="item"
          class="flex items-center gap-3 rounded-xl bg-green-50 border border-green-100 px-5 py-4"
        >
          <span class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">✓</span>
          <span class="text-gray-800 font-medium text-sm">{{ item }}</span>
        </div>
      </div>
    </section>

    <!-- Depoimentos -->
    <section class="bg-gray-50 border-y">
      <div class="max-w-4xl mx-auto px-6 py-14">
        <h2 class="text-2xl font-extrabold text-gray-900 text-center mb-8">{{ ui.reviewsTitle }}</h2>
        <div class="grid md:grid-cols-3 gap-5">
          <div v-for="r in reviews" :key="r.name" class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div class="flex items-center gap-0.5 text-yellow-500 mb-3">
              <span v-for="i in 5" :key="i">★</span>
            </div>
            <p class="text-gray-700 text-sm leading-relaxed mb-4">"{{ r.text }}"</p>
            <div class="text-xs font-bold text-gray-500">— {{ r.name }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ compacto -->
    <section class="max-w-3xl mx-auto px-6 py-14">
      <h2 class="text-2xl font-extrabold text-gray-900 text-center mb-8">{{ ui.faqTitle }}</h2>
      <div class="space-y-4">
        <div v-for="q in faq" :key="q.q" class="rounded-xl border border-gray-100 bg-white p-5">
          <div class="font-bold text-gray-900 mb-1">{{ q.q }}</div>
          <div class="text-sm text-gray-600 leading-relaxed">{{ q.a }}</div>
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="bg-gradient-to-b from-blue-50 to-white border-t py-16 text-center">
      <div class="max-w-2xl mx-auto px-6">
        <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">{{ ui.finalCtaTitle }}</h2>
        <p class="text-gray-500 mb-8">{{ ui.finalCtaSub }}</p>
        <a
          :href="productUrl"
          class="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg px-10 py-4 rounded-2xl transition shadow-lg shadow-blue-200/60 hover:scale-[1.02]"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
          </svg>
          {{ ui.cta3 }}
        </a>
        <p class="mt-4 text-xs text-gray-400">{{ ui.guarantee }}</p>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'lp' })

const productUrl = '/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive'

const intl = useIntlContext()
const isEn = computed(() => intl.language.value === 'en')

const ui = computed(() => isEn.value ? {
  badge: 'Official Original License',
  h1: 'Microsoft 365 — Genuine License for PC, Mac and Mobile',
  sub: 'Install Word, Excel, PowerPoint, Outlook and more on up to 5 devices. 1TB OneDrive included. Instant delivery.',
  cta1: 'Get my license now',
  trust: '✔ No subscription  •  ✔ Instant email delivery  •  ✔ Support included',
  socialProof: '+15,000 activations — rated 5 stars by customers',
  featuresTitle: 'Everything you need, all in one place',
  featuresSub: 'The most complete Microsoft 365 package available',
  midCtaTitle: 'Ready to install Office on all your devices?',
  cta2: 'Buy now',
  includedTitle: "What's included",
  reviewsTitle: 'What our customers say',
  faqTitle: 'Frequently asked questions',
  finalCtaTitle: "Don't miss this",
  finalCtaSub: 'Get your Microsoft 365 license now with instant email delivery.',
  cta3: 'Buy Microsoft 365',
  guarantee: '30-day money-back guarantee  •  Secure payment',
} : {
  badge: 'Licença Original Oficial',
  h1: 'Microsoft 365 — Licença Genuína para PC, Mac e Celular',
  sub: 'Instale Word, Excel, PowerPoint, Outlook e mais em até 5 dispositivos. 1TB no OneDrive incluído. Entrega imediata.',
  cta1: 'Quero minha licença agora',
  trust: '✔ Sem mensalidade  •  ✔ Entrega imediata por e-mail  •  ✔ Suporte incluso',
  socialProof: '+15.000 ativações — avaliado com 5 estrelas pelos clientes',
  featuresTitle: 'Tudo o que você precisa, em um só lugar',
  featuresSub: 'O pacote Microsoft 365 mais completo disponível',
  midCtaTitle: 'Pronto para instalar o Office em todos os seus dispositivos?',
  cta2: 'Comprar agora',
  includedTitle: 'O que está incluído',
  reviewsTitle: 'O que nossos clientes dizem',
  faqTitle: 'Perguntas frequentes',
  finalCtaTitle: 'Não perca esta oportunidade',
  finalCtaSub: 'Receba sua licença Microsoft 365 agora mesmo com entrega imediata por e-mail.',
  cta3: 'Comprar Microsoft 365',
  guarantee: 'Garantia de 30 dias  •  Pagamento seguro',
})

const features = computed(() => isEn.value ? [
  { icon: '⚡', title: 'Instant delivery', desc: 'Receive your license by email in minutes' },
  { icon: '💻', title: 'Up to 5 devices', desc: 'Install on PC, Mac, Android and iOS' },
  { icon: '☁️', title: '1TB OneDrive', desc: 'Cloud storage included in the package' },
  { icon: '🔒', title: 'Genuine license', desc: 'Official activation, no blocks or errors' },
] : [
  { icon: '⚡', title: 'Entrega imediata', desc: 'Receba sua licença por e-mail em minutos' },
  { icon: '💻', title: 'Até 5 dispositivos', desc: 'Instale em PC, Mac, Android e iOS' },
  { icon: '☁️', title: '1TB no OneDrive', desc: 'Armazenamento em nuvem incluso no pacote' },
  { icon: '🔒', title: 'Licença genuína', desc: 'Ativação oficial, sem bloqueios ou erros' },
])

const includedItems = computed(() => isEn.value ? [
  'Microsoft Word — Full version',
  'Microsoft Excel — Full version',
  'Microsoft PowerPoint — Full version',
  'Microsoft Outlook — E-mail and calendar',
  'Microsoft OneNote — Notes and organization',
  'Microsoft Teams — Meetings and collaboration',
  'Microsoft OneDrive — 1TB cloud storage',
  'Works on PC and Mac',
  'Works on Android and iOS',
  'Up to 5 devices simultaneously',
  'Regular updates included',
  'Email support included',
] : [
  'Microsoft Word — Versão completa',
  'Microsoft Excel — Versão completa',
  'Microsoft PowerPoint — Versão completa',
  'Microsoft Outlook — E-mail e calendário',
  'Microsoft OneNote — Notas e organização',
  'Microsoft Teams — Reuniões e colaboração',
  'Microsoft OneDrive — 1TB de armazenamento',
  'Funciona em PC e Mac',
  'Funciona em Android e iOS',
  'Até 5 dispositivos simultâneos',
  'Atualizações regulares inclusas',
  'Suporte por e-mail incluso',
])

const reviews = computed(() => isEn.value ? [
  { name: 'Lucas M.', text: 'Received the license in less than 5 minutes. Installation was super easy and everything works perfectly.' },
  { name: 'Ana S.', text: 'Installed on PC, notebook and cell phone. Excellent value for money. Support responded quickly.' },
  { name: 'Carlos R.', text: 'Was very hesitant but it worked. Word, Excel, everything is activated and running normally.' },
] : [
  { name: 'Lucas M.', text: 'Recebi a licença em menos de 5 minutos. A instalação foi super fácil e tudo funcionou perfeitamente.' },
  { name: 'Ana S.', text: 'Instalei no PC, no notebook e no celular. Ótimo custo-benefício. O suporte respondeu rápido.' },
  { name: 'Carlos R.', text: 'Desconfiado no início, mas funcionou. Word, Excel, tudo ativado e rodando normalmente.' },
])

const faq = computed(() => isEn.value ? [
  { q: 'How do I receive the license?', a: 'After payment confirmation, we send the license and activation instructions to your email in minutes.' },
  { q: 'Does it work on Mac?', a: 'Yes! Microsoft 365 works on Windows PC and Mac, as well as Android and iOS mobile devices.' },
  { q: 'Do I need to renew it?', a: 'No. This is a permanent license — you pay once and use it without monthly fees.' },
  { q: 'How many devices can I install on?', a: 'You can install on up to 5 devices simultaneously, between PCs, Macs, smartphones and tablets.' },
] : [
  { q: 'Como recebo a licença?', a: 'Após confirmação do pagamento, enviamos a licença e as instruções de ativação para o seu e-mail em minutos.' },
  { q: 'Funciona no Mac?', a: 'Sim! O Microsoft 365 funciona em PC Windows e Mac, além de dispositivos móveis Android e iOS.' },
  { q: 'Preciso renovar?', a: 'Não. Esta é uma licença permanente — você paga uma vez e usa sem mensalidades.' },
  { q: 'Quantos dispositivos posso instalar?', a: 'Você pode instalar em até 5 dispositivos simultaneamente, entre PCs, Macs, smartphones e tablets.' },
])

useSeoMeta(computed(() => ({
  title: isEn.value
    ? 'Buy Microsoft 365 – Genuine License for 5 Devices | Instant Delivery'
    : 'Comprar Microsoft 365 – Licença Genuína para 5 Dispositivos | Entrega Imediata',
  description: isEn.value
    ? 'Get original Microsoft 365 with Word, Excel, PowerPoint for up to 5 devices. 1TB OneDrive included. Instant email delivery and 30-day guarantee.'
    : 'Obtenha o Microsoft 365 original com Word, Excel, PowerPoint para até 5 dispositivos. 1TB OneDrive incluso. Entrega imediata por e-mail e garantia de 30 dias.',
  robots: 'index,follow',
})))
</script>
