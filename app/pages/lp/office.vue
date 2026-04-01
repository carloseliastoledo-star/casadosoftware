<template>
  <div class="min-h-screen bg-black text-white">
    <section class="px-4 py-12 text-center max-w-3xl mx-auto">
      <h1 class="text-3xl md:text-5xl font-extrabold leading-tight">
        {{ ui.h1 }}
      </h1>
      <p class="mt-4 text-lg text-gray-300">{{ ui.sub }}</p>
      <div class="mt-6 bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-sm">
        {{ ui.warning }}
      </div>
      <a href="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive"
        class="mt-8 inline-block bg-green-500 text-black font-extrabold text-lg px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition">
        {{ ui.cta1 }}
      </a>
      <p class="mt-4 text-sm text-gray-400">{{ ui.trust }}</p>
    </section>

    <section class="bg-white/5 py-8 text-center">
      <h2 class="text-2xl font-bold">{{ ui.social }}</h2>
      <p class="text-yellow-400 mt-2">⭐⭐⭐⭐⭐ {{ ui.clients }}</p>
    </section>

    <section class="px-4 py-12 max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
      <div class="bg-white/5 p-6 rounded-xl">
        <h3 class="font-bold text-lg">⚡ {{ ui.f1t }}</h3>
        <p class="text-gray-300 mt-2">{{ ui.f1d }}</p>
      </div>
      <div class="bg-white/5 p-6 rounded-xl">
        <h3 class="font-bold text-lg">💻 {{ ui.f2t }}</h3>
        <p class="text-gray-300 mt-2">{{ ui.f2d }}</p>
      </div>
      <div class="bg-white/5 p-6 rounded-xl">
        <h3 class="font-bold text-lg">🔐 {{ ui.f3t }}</h3>
        <p class="text-gray-300 mt-2">{{ ui.f3d }}</p>
      </div>
      <div class="bg-white/5 p-6 rounded-xl">
        <h3 class="font-bold text-lg">🛠 {{ ui.f4t }}</h3>
        <p class="text-gray-300 mt-2">{{ ui.f4d }}</p>
      </div>
    </section>

    <section class="text-center py-10">
      <a href="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive"
        class="bg-green-500 text-black font-extrabold text-lg px-10 py-5 rounded-xl hover:scale-105 transition">
        {{ ui.cta2 }}
      </a>
    </section>

    <section class="px-4 py-12 max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold text-center mb-6">{{ ui.compH2 }}</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-red-500/10 border border-red-500/20 p-6 rounded-xl">
          <h3 class="font-bold">{{ ui.noActH }}</h3>
          <ul class="mt-3 text-gray-300 space-y-2">
            <li>• {{ ui.no1 }}</li>
            <li>• {{ ui.no2 }}</li>
            <li>• {{ ui.no3 }}</li>
            <li>• {{ ui.no4 }}</li>
          </ul>
        </div>
        <div class="bg-green-500/10 border border-green-500/20 p-6 rounded-xl">
          <h3 class="font-bold">{{ ui.yesActH }}</h3>
          <ul class="mt-3 text-gray-300 space-y-2">
            <li>• {{ ui.yes1 }}</li>
            <li>• {{ ui.yes2 }}</li>
            <li>• {{ ui.yes3 }}</li>
            <li>• {{ ui.yes4 }}</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="px-4 py-12 max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
      <div class="bg-white/5 p-6 rounded-xl">⭐⭐⭐⭐⭐<p class="mt-3 text-gray-300">{{ ui.r1 }}</p></div>
      <div class="bg-white/5 p-6 rounded-xl">⭐⭐⭐⭐⭐<p class="mt-3 text-gray-300">{{ ui.r2 }}</p></div>
      <div class="bg-white/5 p-6 rounded-xl">⭐⭐⭐⭐⭐<p class="mt-3 text-gray-300">{{ ui.r3 }}</p></div>
    </section>

    <section class="text-center py-12 bg-red-500/10">
      <h2 class="text-2xl font-extrabold">{{ ui.urgH2 }}</h2>
      <p class="mt-3 text-gray-300">{{ ui.urgSub }}</p>
      <a href="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive"
        class="mt-6 inline-block bg-green-500 text-black font-extrabold text-lg px-10 py-5 rounded-xl hover:scale-105 transition">
        {{ ui.cta3 }}
      </a>
    </section>
  </div>
</template>

<script setup>
const intl = useIntlContext()
const isEn = computed(() => intl.language.value === 'en')

const ui = computed(() => isEn.value ? ({
  h1: '⚠️ Your Office expired and you lost access to Word and Excel?',
  sub: 'Activate now in less than 5 minutes and get back to using everything without blocks',
  warning: '⚠️ Without activation, Office may block editing, saving files or limit features',
  cta1: '🔓 UNLOCK MY OFFICE NOW',
  trust: '✔ No subscription • ✔ Instant delivery • ✔ Support included',
  social: '+15,000 successful activations',
  clients: 'Satisfied customers',
  f1t: 'Instant activation', f1d: 'Receive and activate in minutes',
  f2t: 'Works everywhere',   f2d: 'PC, Mac, Android and iOS',
  f3t: 'Secure',             f3d: 'Avoid blocks and activation errors',
  f4t: 'Support',            f4d: 'Help if you need to activate',
  cta2: 'ACTIVATE NOW',
  compH2: 'What happens without activation?',
  noActH:  '❌ Without activation', no1: 'Word blocked', no2: 'Excel limited', no3: 'Cannot save files', no4: 'Constant errors',
  yesActH: '✅ With activation',    yes1: 'Everything unlocked', yes2: 'Full use', yes3: 'No blocks', yes4: 'Works normally',
  r1: '"Fixed it right away, was stuck here"',
  r2: '"Received and activated the same day"',
  r3: '"Worked perfectly on my laptop"',
  urgH2: '⚠️ Don't wait for your Office to lock up completely',
  urgSub: 'Fix it now and avoid losing access to your files',
  cta3: 'UNLOCK NOW'
}) : ({
  h1: '⚠️ Seu Office expirou e você perdeu acesso ao Word e Excel?',
  sub: 'Ative agora em menos de 5 minutos e volte a usar tudo sem bloqueios',
  warning: '⚠️ Sem ativação, o Office pode bloquear edição, salvar arquivos ou limitar funções',
  cta1: '🔓 LIBERAR MEU OFFICE AGORA',
  trust: '✔ Sem mensalidade • ✔ Entrega imediata • ✔ Suporte incluso',
  social: '+15.000 ativações realizadas com sucesso',
  clients: 'Clientes satisfeitos',
  f1t: 'Ativação imediata', f1d: 'Receba e ative em poucos minutos',
  f2t: 'Funciona em tudo',  f2d: 'PC, Mac, Android e iOS',
  f3t: 'Seguro',            f3d: 'Evite bloqueios e erros de ativação',
  f4t: 'Suporte',           f4d: 'Ajuda caso precise ativar',
  cta2: 'ATIVAR AGORA',
  compH2: 'O que acontece sem ativação?',
  noActH:  '❌ Sem ativação', no1: 'Word bloqueado', no2: 'Excel limitado', no3: 'Não salva arquivos', no4: 'Erros constantes',
  yesActH: '✅ Com ativação',  yes1: 'Tudo liberado',  yes2: 'Uso completo',  yes3: 'Sem bloqueios',   yes4: 'Funciona normal',
  r1: '"Resolveu na hora, tava travado aqui"',
  r2: '"Recebi e ativei no mesmo dia"',
  r3: '"Funcionou perfeito no meu notebook"',
  urgH2: '⚠️ Não espere seu Office travar totalmente',
  urgSub: 'Resolva agora e evite perder acesso aos seus arquivos',
  cta3: 'LIBERAR AGORA'
}))

definePageMeta({ layout: 'lp' })

useSeoMeta(computed(() => ({
  title: isEn.value ? 'Office expired? Activate now in minutes' : 'Office expirado? Ative agora em minutos',
  description: isEn.value ? 'Recover access to Word, Excel and PowerPoint now with no subscription.' : 'Recupere acesso ao Word, Excel e PowerPoint agora mesmo sem mensalidade.'
})))
</script>