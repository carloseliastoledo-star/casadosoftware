<script setup lang="ts">
definePageMeta({
  layout: 'blank'
})

const intl = useIntlContext()
const isEn = computed(() => intl.language.value === 'en')

const ui = computed(() => isEn.value ? ({
  seoTitle: 'Activate Office 365 Now | Instant Delivery & Support',
  seoDesc: 'Activate your Office 365 now with digital delivery, support and quick access to Word, Excel, PowerPoint and 1TB OneDrive.',
  badge1: 'Office 365 Deal',
  badge2: 'Instant delivery',
  badge3: 'Activate in minutes',
  h1a: 'Activate Your',
  h1b: 'Office 365',
  h1c: 'Now',
  hero: 'Stop wasting time with blocks, expired subscriptions and activation errors. Get back to using Word, Excel, PowerPoint and OneDrive with a fast, practical solution.',
  cta1: 'ACTIVATE NOW',
  cta2: '5 licenses • Support',
  feat1: 'Fast activation',
  feat2: 'Digital delivery',
  feat3: 'Support included',
  card1: 'What you unlock',
  li1: 'Word, Excel, PowerPoint and Outlook',
  li2: 'Compatible with PC, Mac, Android and iPhone',
  li3: 'Quick setup with no hassle',
  card2: 'Ideal for those who want to activate today and get back to work without blocks.',
  cta3: 'ACTIVATE MY OFFICE',
  howBadge: 'How it works',
  howH2: 'Activate in 3 simple steps',
  howSub: 'Straightforward process so you can fix it fast and get back to normal.',
  step1: 'Purchase', step1d: 'Choose the ideal solution to activate your Office 365 quickly.',
  step2: 'Receive',  step2d: 'Instant digital delivery so you do not waste time waiting.',
  step3: 'Activate', step3d: 'Follow the process and get back to using Word, Excel and PowerPoint in minutes.',
  ctaBadge: 'Immediate action',
  ctaH2: 'Stop being blocked with a locked Office',
  ctaSub: 'Activate now and get back to using your apps with convenience, speed and full focus on results.',
  ctaBtn: 'ACTIVATE OFFICE 365 NOW',
  ctaNote: 'No menu • No distractions • Full conversion focus'
}) : ({
  seoTitle: 'Ativar Office 365 Agora | Entrega Imediata e Suporte',
  seoDesc: 'Ative seu Office 365 agora com entrega digital, suporte e acesso rápido ao Word, Excel, PowerPoint e 1TB OneDrive.',
  badge1: 'Oferta Office 365',
  badge2: 'Entrega imediata',
  badge3: 'Ative em poucos minutos',
  h1a: 'Ative Seu',
  h1b: 'Office 365',
  h1c: 'Agora',
  hero: 'Pare de perder tempo com bloqueios, assinatura expirada e erro de ativação. Volte a usar Word, Excel, PowerPoint e OneDrive com uma solução rápida, prática e direta.',
  cta1: 'ATIVAR AGORA',
  cta2: '5 licenças • Suporte',
  feat1: 'Ativação rápida',
  feat2: 'Entrega digital',
  feat3: 'Suporte incluso',
  card1: 'O que você libera',
  li1: 'Word, Excel, PowerPoint e Outlook',
  li2: 'Compatível com PC, Mac, Android e iPhone',
  li3: 'Uso rápido sem enrolação',
  card2: 'Ideal para quem quer ativar hoje e voltar a trabalhar sem travas.',
  cta3: 'QUERO ATIVAR MEU OFFICE',
  howBadge: 'Como funciona',
  howH2: 'Ative em 3 passos simples',
  howSub: 'Processo direto para você resolver rápido e voltar a usar normalmente.',
  step1: 'Compre',  step1d: 'Escolha a solução ideal para ativar seu Office 365 com rapidez.',
  step2: 'Receba',  step2d: 'Entrega digital imediata para você não perder tempo esperando.',
  step3: 'Ative',   step3d: 'Siga o processo e volte a usar Word, Excel e PowerPoint em minutos.',
  ctaBadge: 'Ação imediata',
  ctaH2: 'Não fique travado com Office bloqueado',
  ctaSub: 'Ative agora e volte a usar seus aplicativos com praticidade, rapidez e foco total em resultado.',
  ctaBtn: 'ATIVAR OFFICE 365 AGORA',
  ctaNote: 'Sem menu • Sem distrações • Foco total em conversão'
}))

useSeoMeta(computed(() => ({
  title: ui.value.seoTitle,
  description: ui.value.seoDesc,
  ogTitle: ui.value.seoTitle,
  ogDescription: ui.value.seoDesc,
  robots: 'index,follow'
})))
</script>

<template>
  <main class="min-h-screen bg-white text-slate-900">
    <section class="border-b border-slate-200 bg-slate-50">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          {{ ui.badge1 }}
        </div>
        <div class="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-green-200">
          {{ ui.badge2 }}
        </div>
      </div>
    </section>

    <section class="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.10),_transparent_30%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
      <div class="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div class="grid items-center gap-10 md:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div class="inline-flex rounded-full bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700 ring-1 ring-blue-200">
              {{ ui.badge3 }}
            </div>

            <h1 class="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
              {{ ui.h1a }}
              <span class="text-blue-600">{{ ui.h1b }}</span>
              {{ ui.h1c }}
            </h1>

            <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              {{ ui.hero }}
            </p>

            <div class="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive"
                class="inline-flex min-h-[60px] items-center justify-center rounded-2xl bg-green-600 px-8 text-lg font-extrabold text-white shadow-[0_16px_34px_rgba(22,163,74,0.30)] transition hover:scale-[1.02] hover:bg-green-700"
              >
                {{ ui.cta1 }}
              </a>

              <div class="inline-flex min-h-[60px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 shadow-sm">
                {{ ui.cta2 }}
              </div>
            </div>

            <div class="mt-8 grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="text-2xl">⚡</div>
                <p class="mt-2 text-sm font-bold text-slate-900">{{ ui.feat1 }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="text-2xl">📩</div>
                <p class="mt-2 text-sm font-bold text-slate-900">{{ ui.feat2 }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="text-2xl">🛟</div>
                <p class="mt-2 text-sm font-bold text-slate-900">{{ ui.feat3 }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div class="rounded-2xl bg-slate-950 p-5 text-white">
              <div class="text-sm font-semibold text-slate-300">{{ ui.card1 }}</div>

              <ul class="mt-4 space-y-3 text-sm md:text-base">
                <li class="flex items-start gap-3">
                  <span class="text-green-400">✔</span>
                  <span>{{ ui.li1 }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-green-400">✔</span>
                  <span>{{ ui.li2 }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-green-400">✔</span>
                  <span>{{ ui.li3 }}</span>
                </li>
              </ul>
            </div>

            <div class="mt-5 rounded-2xl bg-blue-50 p-4 text-blue-700 ring-1 ring-blue-200">
              {{ ui.card2 }}
            </div>

            <a
              href="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive"
              class="mt-5 inline-flex w-full min-h-[58px] items-center justify-center rounded-2xl bg-blue-600 px-6 text-lg font-extrabold text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)] transition hover:scale-[1.01] hover:bg-blue-700"
            >
              {{ ui.cta3 }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="py-14 md:py-20">
      <div class="mx-auto max-w-6xl px-4 md:px-6">
        <div class="text-center">
          <div class="inline-flex rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
            {{ ui.howBadge }}
          </div>
          <h2 class="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
            {{ ui.howH2 }}
          </h2>
          <p class="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            {{ ui.howSub }}
          </p>
        </div>

        <div class="mt-10 grid gap-6 md:grid-cols-3">
          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="text-3xl font-black text-blue-600">1</div>
            <h3 class="mt-4 text-xl font-black text-slate-950">{{ ui.step1 }}</h3>
            <p class="mt-3 leading-7 text-slate-600">{{ ui.step1d }}</p>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="text-3xl font-black text-blue-600">2</div>
            <h3 class="mt-4 text-xl font-black text-slate-950">{{ ui.step2 }}</h3>
            <p class="mt-3 leading-7 text-slate-600">{{ ui.step2d }}</p>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="text-3xl font-black text-blue-600">3</div>
            <h3 class="mt-4 text-xl font-black text-slate-950">{{ ui.step3 }}</h3>
            <p class="mt-3 leading-7 text-slate-600">{{ ui.step3d }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-slate-950 py-14 text-white md:py-20">
      <div class="mx-auto max-w-5xl px-4 text-center md:px-6">
        <div class="inline-flex rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-white/90 ring-1 ring-white/10">
          {{ ui.ctaBadge }}
        </div>

        <h2 class="mt-4 text-3xl font-black tracking-tight md:text-5xl">
          {{ ui.ctaH2 }}
        </h2>

        <p class="mx-auto mt-5 max-w-3xl text-lg text-slate-300">
          {{ ui.ctaSub }}
        </p>

        <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive"
            class="inline-flex min-h-[60px] items-center justify-center rounded-2xl bg-green-600 px-10 text-lg font-extrabold text-white shadow-[0_16px_34px_rgba(22,163,74,0.35)] transition hover:scale-[1.02] hover:bg-green-700"
          >
            {{ ui.ctaBtn }}
          </a>
        </div>

        <p class="mt-4 text-sm text-slate-400">
          {{ ui.ctaNote }}
        </p>
      </div>
    </section>
  </main>
</template>