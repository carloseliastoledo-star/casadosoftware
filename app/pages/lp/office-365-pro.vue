<template>
  <div class="bg-white min-h-screen font-sans">

    <!-- ═══════════════════════════════════════════
         SEÇÃO 1 — HERO (dobra principal)
    ════════════════════════════════════════════════ -->
    <section class="bg-[#0a1628] text-white relative overflow-hidden">
      <!-- Detalhe decorativo de fundo -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-indigo-900/30 pointer-events-none" aria-hidden="true" />

      <div class="relative max-w-3xl mx-auto px-5 pt-10 pb-12 text-center">

        <!-- Badge urgência -->
        <div class="inline-flex items-center gap-2 rounded-full bg-red-600/20 border border-red-500/40 px-4 py-1.5 text-sm font-bold text-red-300 mb-6 uppercase tracking-wide">
          <span class="h-2 w-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" aria-hidden="true" />
          {{ t.heroBadge }}
        </div>

        <!-- Headline principal -->
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.08] tracking-tight mb-4">
          {{ t.heroH1Line1 }}<br />
          <span class="text-green-400">{{ t.heroH1Line2 }}</span>
        </h1>

        <!-- Subheadline -->
        <p class="text-blue-200 text-lg md:text-xl mb-8 leading-relaxed">
          {{ t.heroSub }}
        </p>

        <!-- Bloco de preço -->
        <div class="inline-flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-8 py-5 mb-7">
          <span class="text-sm text-gray-400 line-through mb-1">{{ t.priceOld }}</span>
          <div class="flex items-end gap-2 leading-none">
            <span class="text-green-400 text-5xl md:text-6xl font-black">{{ t.priceNew }}</span>
            <span class="text-green-300 text-lg font-bold mb-1">{{ t.priceLabel }}</span>
          </div>
          <span class="mt-2 text-xs text-yellow-300 font-semibold uppercase tracking-widest">{{ t.priceUrgency }}</span>
        </div>

        <!-- Botão CTA principal -->
        <div class="flex flex-col items-center gap-3">
          <a
            :href="productUrl"
            class="w-full max-w-sm inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-black text-xl py-5 px-8 rounded-2xl shadow-xl shadow-green-900/40 transition-all hover:scale-[1.02] active:scale-[0.99]"
          >
            <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
            {{ t.heroCta }}
          </a>

          <!-- Subtexto de confiança -->
          <p class="text-sm text-blue-200 leading-relaxed">{{ t.heroTrust }}</p>

          <!-- Alerta de escassez -->
          <div class="flex items-center gap-2 text-yellow-300 text-sm font-semibold">
            <span aria-hidden="true">⚠</span>{{ t.heroScarcity }}
          </div>
        </div>

      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 2 — PROVA SOCIAL
    ════════════════════════════════════════════════ -->
    <section class="bg-gray-900 border-b border-gray-800">
      <div class="max-w-3xl mx-auto px-5 py-5 flex items-center justify-center gap-3 text-center">
        <span class="text-yellow-400 text-xl tracking-tight">★★★★★</span>
        <span class="text-gray-200 font-bold text-sm md:text-base">{{ t.socialProof }}</span>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 3 — DOR DO USUÁRIO
    ════════════════════════════════════════════════ -->
    <section class="bg-red-50 border-y border-red-100">
      <div class="max-w-3xl mx-auto px-5 py-12">
        <h2 class="text-2xl md:text-3xl font-black text-gray-900 text-center mb-2">{{ t.painTitle }}</h2>
        <p class="text-center text-gray-500 mb-8 text-sm">{{ t.painSub }}</p>
        <div class="grid sm:grid-cols-2 gap-4">
          <div
            v-for="pain in painItems"
            :key="pain.icon"
            class="flex items-start gap-3 bg-white rounded-xl border border-red-100 px-5 py-4 shadow-sm"
          >
            <span class="text-red-500 text-xl flex-shrink-0 mt-0.5" aria-hidden="true">{{ pain.icon }}</span>
            <div>
              <div class="font-bold text-gray-900 text-sm">{{ pain.title }}</div>
              <div class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ pain.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 4 — SOLUÇÃO
    ════════════════════════════════════════════════ -->
    <section class="bg-white border-b">
      <div class="max-w-3xl mx-auto px-5 py-12">
        <h2 class="text-2xl md:text-3xl font-black text-gray-900 text-center mb-2">{{ t.solutionTitle }}</h2>
        <p class="text-center text-gray-500 mb-8 text-sm">{{ t.solutionSub }}</p>
        <div class="grid sm:grid-cols-2 gap-4">
          <div
            v-for="(step, i) in solutionSteps"
            :key="i"
            class="flex items-start gap-4 bg-blue-50 rounded-xl border border-blue-100 px-5 py-4"
          >
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">
              {{ i + 1 }}
            </div>
            <div>
              <div class="font-bold text-gray-900 text-sm">{{ step.title }}</div>
              <div class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ step.desc }}</div>
            </div>
          </div>
        </div>

        <!-- CTA dentro da solução -->
        <div class="text-center mt-10">
          <a
            :href="productUrl"
            class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black text-lg px-10 py-4 rounded-2xl transition shadow-lg shadow-green-200/60"
          >
            {{ t.solutionCta }}
          </a>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 5 — BENEFÍCIOS (cards)
    ════════════════════════════════════════════════ -->
    <section class="bg-gray-50 border-b">
      <div class="max-w-3xl mx-auto px-5 py-12">
        <h2 class="text-2xl font-black text-gray-900 text-center mb-8">{{ t.benefitsTitle }}</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="b in benefits"
            :key="b.icon"
            class="rounded-xl border border-gray-200 bg-white p-5 text-center hover:border-blue-300 hover:bg-blue-50 transition"
          >
            <div class="text-3xl mb-2" aria-hidden="true">{{ b.icon }}</div>
            <div class="font-bold text-gray-900 text-sm leading-snug mb-1">{{ b.title }}</div>
            <div class="text-xs text-gray-500 leading-relaxed">{{ b.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 6 — O QUE ESTÁ INCLUSO
    ════════════════════════════════════════════════ -->
    <section class="bg-white border-b">
      <div class="max-w-3xl mx-auto px-5 py-12">
        <h2 class="text-2xl font-black text-gray-900 text-center mb-8">{{ t.includedTitle }}</h2>
        <div class="grid sm:grid-cols-2 gap-3">
          <div
            v-for="item in includedItems"
            :key="item.name"
            class="flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 px-5 py-4"
          >
            <span class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-sm mt-0.5">✓</span>
            <div>
              <div class="font-bold text-gray-900 text-sm">{{ item.name }}</div>
              <div class="text-xs text-gray-500 leading-relaxed mt-0.5">{{ item.use }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 7 — DEPOIMENTOS
    ════════════════════════════════════════════════ -->
    <section class="bg-gray-50 border-b">
      <div class="max-w-3xl mx-auto px-5 py-12">
        <h2 class="text-2xl font-black text-gray-900 text-center mb-8">{{ t.reviewsTitle }}</h2>
        <div class="grid md:grid-cols-3 gap-5">
          <div
            v-for="r in reviews"
            :key="r.name"
            class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col"
          >
            <div class="text-yellow-400 text-lg tracking-tight mb-3">★★★★★</div>
            <p class="text-gray-700 text-sm leading-relaxed flex-1 mb-4">"{{ r.text }}"</p>
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                {{ r.name.charAt(0) }}
              </div>
              <span class="text-xs font-bold text-gray-600">{{ r.name }}</span>
              <span class="text-xs text-green-600 font-semibold ml-auto">{{ t.reviewVerified }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 8 — QUEBRA DE OBJEÇÃO
    ════════════════════════════════════════════════ -->
    <section class="bg-blue-700 text-white">
      <div class="max-w-3xl mx-auto px-5 py-12 text-center">
        <h2 class="text-2xl font-black mb-6">{{ t.objectionTitle }}</h2>
        <div class="grid sm:grid-cols-3 gap-4 mb-8">
          <div
            v-for="obj in objections"
            :key="obj.title"
            class="bg-white/10 border border-white/20 rounded-xl px-5 py-5"
          >
            <div class="text-green-300 text-2xl mb-2" aria-hidden="true">{{ obj.icon }}</div>
            <div class="font-bold text-white text-sm mb-1">{{ obj.title }}</div>
            <div class="text-blue-200 text-xs leading-relaxed">{{ obj.desc }}</div>
          </div>
        </div>
        <a
          :href="productUrl"
          class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black text-lg px-10 py-4 rounded-2xl transition shadow-xl"
        >
          {{ t.objectionCta }}
        </a>
        <p class="mt-3 text-blue-200 text-xs">{{ t.objectionSub }}</p>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 9 — CTA FINAL
    ════════════════════════════════════════════════ -->
    <section class="bg-[#0a1628] text-white">
      <div class="max-w-2xl mx-auto px-5 py-16 text-center">
        <div class="text-yellow-400 text-3xl mb-4" aria-hidden="true">⚡</div>
        <h2 class="text-2xl md:text-3xl font-black mb-3">{{ t.finalCtaTitle }}</h2>
        <p class="text-blue-200 mb-8 text-sm leading-relaxed">{{ t.finalCtaSub }}</p>

        <!-- Preço repetido -->
        <div class="inline-flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-8 py-4 mb-7">
          <span class="text-gray-400 line-through text-sm mb-1">{{ t.priceOld }}</span>
          <span class="text-green-400 text-4xl font-black">{{ t.priceNew }}</span>
          <span class="text-xs text-yellow-300 font-semibold uppercase tracking-widest mt-1">{{ t.priceUrgency }}</span>
        </div>

        <div class="flex flex-col items-center gap-3">
          <a
            :href="productUrl"
            class="w-full max-w-sm inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-black text-xl py-5 px-8 rounded-2xl shadow-xl shadow-green-900/40 transition-all hover:scale-[1.02]"
          >
            <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
            {{ t.finalCta }}
          </a>
          <p class="text-blue-300 text-xs">{{ t.finalSub }}</p>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'lp' })

const productUrl = '/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive'

const intl = useIntlContext()
const isEn = computed(() => intl.language.value === 'en')

const t = computed(() => isEn.value ? {
  heroBadge: '⚠ Limited offer today',
  heroH1Line1: 'YOUR OFFICE STOPPED WORKING?',
  heroH1Line2: 'Activate in under 5 minutes',
  heroSub: 'Original license — no subscription, no monthly fees. Works on PC, Mac, Android and iOS.',
  priceOld: 'Was $49',
  priceNew: '$9',
  priceLabel: 'today',
  priceUrgency: '⚡ Last discounted licenses',
  heroCta: 'ACTIVATE NOW',
  heroTrust: '✔ Instant delivery  •  ✔ Works on PC & mobile  •  ✔ Support included',
  heroScarcity: 'Last discounted licenses available',
  socialProof: '+15,000 customers already activated successfully',
  painTitle: 'What happens without an activated Office?',
  painSub: 'If your Office is blocked, you lose time and productivity every single day.',
  solutionTitle: 'Solve it in just a few minutes',
  solutionSub: 'Simple, fast, no technical knowledge required.',
  solutionCta: 'ACTIVATE NOW',
  benefitsTitle: 'What you get with this license',
  includedTitle: "What's included in the package",
  reviewsTitle: 'Customers who already activated',
  reviewVerified: '✔ Verified',
  objectionTitle: 'Still have doubts?',
  objectionCta: 'YES, I WANT MY LICENSE',
  objectionSub: 'Secure payment • Instant delivery after confirmation',
  finalCtaTitle: "Don't miss this opportunity",
  finalCtaSub: 'Get your Microsoft 365 license right now. Instant delivery after payment.',
  finalCta: 'ACTIVATE NOW',
  finalSub: 'Instant delivery after payment confirmation',
} : {
  heroBadge: '⚠ Oferta limitada hoje',
  heroH1Line1: 'SEU OFFICE PAROU DE FUNCIONAR?',
  heroH1Line2: 'Ative em menos de 5 minutos',
  heroSub: 'Licença original — sem mensalidade, sem renovação. Funciona em PC, Mac, Android e iOS.',
  priceOld: 'De R$199',
  priceNew: 'R$29',
  priceLabel: 'hoje',
  priceUrgency: '⚡ Últimas licenças com desconto',
  heroCta: 'ATIVAR AGORA',
  heroTrust: '✔ Entrega imediata  •  ✔ Funciona em PC e celular  •  ✔ Suporte incluso',
  heroScarcity: 'Últimas licenças com desconto disponíveis',
  socialProof: '+15.000 clientes já ativaram com sucesso',
  painTitle: 'O que acontece quando o Office não está ativado?',
  painSub: 'Se o seu Office está bloqueado, você perde tempo e produtividade todos os dias.',
  solutionTitle: 'Resolva em poucos minutos',
  solutionSub: 'Simples, rápido e sem precisar de conhecimento técnico.',
  solutionCta: 'ATIVAR AGORA',
  benefitsTitle: 'O que você leva com essa licença',
  includedTitle: 'O que está incluso no pacote',
  reviewsTitle: 'Clientes que já ativaram',
  reviewVerified: '✔ Verificado',
  objectionTitle: 'Ainda tem dúvidas?',
  objectionCta: 'SIM, QUERO MINHA LICENÇA',
  objectionSub: 'Pagamento seguro • Entrega imediata após confirmação',
  finalCtaTitle: 'Não perca esta oportunidade',
  finalCtaSub: 'Receba sua licença Microsoft 365 agora mesmo. Entrega imediata após o pagamento.',
  finalCta: 'ATIVAR AGORA',
  finalSub: 'Entrega imediata após confirmação do pagamento',
})

const painItems = computed(() => isEn.value ? [
  { icon: '🚫', title: 'Blocked programs', desc: 'Word, Excel and PowerPoint stop working or show constant warnings.' },
  { icon: '⚠️', title: 'Constant error messages', desc: '"Unlicensed Product" warnings interrupt your work every hour.' },
  { icon: '📉', title: 'Loss of productivity', desc: 'Without Office you lose time with slow or limited alternatives.' },
  { icon: '💾', title: 'Risk of losing files', desc: 'Without OneDrive your files are not backed up automatically.' },
] : [
  { icon: '🚫', title: 'Programas bloqueados', desc: 'Word, Excel e PowerPoint param de funcionar ou exibem alertas constantes.' },
  { icon: '⚠️', title: 'Mensagens de erro constantes', desc: 'Avisos de "Produto sem licença" interrompem o seu trabalho toda hora.' },
  { icon: '📉', title: 'Perda de produtividade', desc: 'Sem Office você perde tempo com alternativas lentas e limitadas.' },
  { icon: '💾', title: 'Risco de perder arquivos', desc: 'Sem o OneDrive seus arquivos não ficam salvos automaticamente na nuvem.' },
])

const solutionSteps = computed(() => isEn.value ? [
  { title: 'Receive by email', desc: 'After payment you receive your license in your inbox in minutes.' },
  { title: 'Activate quickly', desc: 'Follow the simple step-by-step — we send it together with the license.' },
  { title: 'Use without limits', desc: 'Full Word, Excel, PowerPoint, Outlook, Teams and 1TB OneDrive.' },
  { title: 'Works everywhere', desc: 'Install on up to 5 devices: PC, Mac, Android and iOS.' },
] : [
  { title: 'Receba por e-mail', desc: 'Após o pagamento você recebe sua licença na caixa de entrada em minutos.' },
  { title: 'Ative rapidamente', desc: 'Siga o passo a passo simples — enviamos junto com a licença.' },
  { title: 'Use sem limitações', desc: 'Word, Excel, PowerPoint, Outlook, Teams e 1TB OneDrive completos.' },
  { title: 'Funciona em tudo', desc: 'Instale em até 5 dispositivos: PC, Mac, Android e iOS.' },
])

const benefits = computed(() => isEn.value ? [
  { icon: '⚡', title: 'Instant delivery', desc: 'In your inbox in minutes' },
  { icon: '💻', title: 'Up to 5 devices', desc: 'PC, Mac, Android, iOS' },
  { icon: '☁️', title: '1TB OneDrive', desc: 'Cloud storage included' },
  { icon: '🔒', title: 'Official license', desc: 'No blocks or errors' },
] : [
  { icon: '⚡', title: 'Entrega imediata', desc: 'Na sua caixa de entrada em minutos' },
  { icon: '💻', title: 'Até 5 dispositivos', desc: 'PC, Mac, Android, iOS' },
  { icon: '☁️', title: '1TB OneDrive', desc: 'Armazenamento em nuvem incluso' },
  { icon: '🔒', title: 'Licença oficial', desc: 'Sem bloqueios ou erros' },
])

const includedItems = computed(() => isEn.value ? [
  { name: 'Microsoft Word', use: 'Create and edit documents, letters and reports' },
  { name: 'Microsoft Excel', use: 'Spreadsheets, charts and financial analysis' },
  { name: 'Microsoft PowerPoint', use: 'Professional presentations for any occasion' },
  { name: 'Microsoft Outlook', use: 'E-mail, calendar and contacts in one place' },
  { name: 'Microsoft Teams', use: 'Video meetings and collaboration with your team' },
  { name: 'Microsoft OneDrive', use: '1TB cloud storage — automatic backup' },
] : [
  { name: 'Microsoft Word', use: 'Crie e edite documentos, cartas e relatórios' },
  { name: 'Microsoft Excel', use: 'Planilhas, gráficos e análises financeiras' },
  { name: 'Microsoft PowerPoint', use: 'Apresentações profissionais para qualquer ocasião' },
  { name: 'Microsoft Outlook', use: 'E-mail, calendário e contatos em um só lugar' },
  { name: 'Microsoft Teams', use: 'Reuniões em vídeo e colaboração com sua equipe' },
  { name: 'Microsoft OneDrive', use: '1TB de armazenamento na nuvem — backup automático' },
])

const reviews = computed(() => isEn.value ? [
  { name: 'Lucas M.', text: 'I was skeptical but it worked perfectly. Received in 3 minutes and activated on the first try. Would buy again!' },
  { name: 'Ana S.', text: 'Installed on my PC, notebook and cell phone with the same license. Incredible value. Support answered within minutes.' },
  { name: 'Carlos R.', text: 'Was afraid to buy online, but the support team guided me through every step. Everything activated and working great.' },
] : [
  { name: 'Lucas M.', text: 'Estava desconfiado mas funcionou perfeitamente. Recebi em 3 minutos e ativei de primeira. Compraria de novo!' },
  { name: 'Ana S.', text: 'Instalei no PC, notebook e celular com a mesma licença. Custo-benefício incrível. O suporte respondeu em minutos.' },
  { name: 'Carlos R.', text: 'Tinha medo de comprar online, mas o suporte me acompanhou em cada etapa. Tudo ativado e funcionando perfeitamente.' },
])

const objections = computed(() => isEn.value ? [
  { icon: '🛡️', title: '30-day guarantee', desc: "If it doesn't work, we'll refund you — no questions asked." },
  { icon: '💬', title: 'Post-purchase support', desc: 'Our team assists you step by step through activation if needed.' },
  { icon: '⚡', title: 'Simple activation', desc: 'Follow the instructions we send and activate in minutes.' },
] : [
  { icon: '🛡️', title: 'Garantia de 30 dias', desc: 'Se não funcionar, devolvemos o seu dinheiro — sem burocracia.' },
  { icon: '💬', title: 'Suporte após a compra', desc: 'Nosso time te acompanha passo a passo na ativação se precisar.' },
  { icon: '⚡', title: 'Ativação simples', desc: 'Siga o tutorial que enviamos e ative em minutos, sem complicação.' },
])

useSeoMeta(computed(() => ({
  title: isEn.value
    ? 'Buy Microsoft 365 – Activate in 5 Minutes | Original License | Instant Delivery'
    : 'Comprar Microsoft 365 – Ative em 5 Minutos | Licença Original | Entrega Imediata',
  description: isEn.value
    ? 'Did your Office stop working? Get original Microsoft 365 for up to 5 devices. Word, Excel, PowerPoint, 1TB OneDrive. Instant delivery and 30-day guarantee.'
    : 'Seu Office parou de funcionar? Obtenha o Microsoft 365 original para até 5 dispositivos. Word, Excel, PowerPoint, 1TB OneDrive. Entrega imediata e garantia de 30 dias.',
  robots: 'index,follow',
})))
</script>
