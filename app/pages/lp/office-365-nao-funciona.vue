<script setup>
const intl = useIntlContext()
const isEn = computed(() => intl.language.value === 'en')

const ui = computed(() => isEn.value ? ({
  seoTitle: 'Office 365 Not Working? See How to Fix It Now',
  seoDesc: 'Is your Office 365 not working? Find out why and see a quick way to get back to using Word, Excel and PowerPoint without blocks.',
  topBadge: 'Quick fix',
  topTag: 'Updated today',
  heroBadge: 'Office issue?',
  h1: 'Office 365 Not Working?',
  heroPara: 'If Word does not open properly, Excel blocked editing or a license warning appeared, here is a practical way to get back to using the suite normally.',
  cta1: 'SEE SOLUTION NOW',
  cta2: 'Fast • Simple • Practical',
  signalsTitle: 'Most common signs',
  s1: 'Product not licensed',
  s2: 'Read-only or editing blocked',
  s3: 'Prompted to renew or reactivate',
  signalsNote: 'This usually indicates an activation failure, invalid previous license or lost access.',
  probBadge: 'The problem',
  probH2: 'When Office stops working, your workflow grinds to a halt',
  probPara: 'This affects simple tasks like editing spreadsheets, saving documents, building presentations and continuing important work.',
  prob1: 'Interruption to work or study',
  prob2: 'Time wasted trying to fix it yourself',
  prob3: 'Annoying messages popping up all the time',
  solBadge: 'The solution',
  solH2: 'Get back to normal without wasting more time',
  solPara: 'Instead of staying stuck with blocks, you can fix this with an option focused on speed, practical activation and stable use.',
  f1t: 'Fast activation', f1d: 'Simple process to get back to using without hassle.',
  f2t: 'Easy to follow',  f2d: 'Made to fix it quickly, no unnecessary complexity.',
  f3t: 'Support included', f3d: 'Help available if you need it during the process.',
  f4t: 'Instant delivery',  f4d: 'Receive fast so you are not stuck any longer.',
  cta3: 'FIX IT NOW',
  ctaBadge: 'Quick access',
  ctaH2: 'Stop wasting time with a blocked Office',
  ctaPara: 'Recover access to your apps and get back to using Word, Excel and PowerPoint with ease.',
  ctaBtn: 'ACTIVATE MY OFFICE NOW',
  ctaNote: 'No menu • No distractions • Full conversion focus'
}) : ({
  seoTitle: 'Office 365 Não Funciona? Veja Como Resolver Agora',
  seoDesc: 'Seu Office 365 não funciona? Entenda o motivo e veja uma forma rápida de voltar a usar Word, Excel e PowerPoint sem bloqueio.',
  topBadge: 'Solução rápida',
  topTag: 'Atualizado hoje',
  heroBadge: 'Office com problema?',
  h1: 'Office 365 Não Funciona?',
  heroPara: 'Se o Word não abre direito, o Excel bloqueou edição ou apareceu aviso de licença, veja uma forma prática de voltar a usar o pacote normalmente.',
  cta1: 'VER SOLUÇÃO AGORA',
  cta2: 'Rápido • Simples • Prático',
  signalsTitle: 'Sinais mais comuns',
  s1: 'Produto não licenciado',
  s2: 'Modo de leitura ou edição bloqueada',
  s3: 'Pedido para renovar ou reativar',
  signalsNote: 'Isso normalmente indica falha de ativação, licença anterior inválida ou acesso perdido.',
  probBadge: 'O problema',
  probH2: 'Quando o Office não funciona, sua rotina trava',
  probPara: 'Isso afeta tarefas simples como editar planilhas, salvar documentos, montar apresentações e continuar um trabalho importante.',
  prob1: 'Interrupção no trabalho ou estudo',
  prob2: 'Perda de tempo tentando corrigir sozinho',
  prob3: 'Mensagens chatas aparecendo toda hora',
  solBadge: 'A solução',
  solH2: 'Volte a usar normalmente sem perder mais tempo',
  solPara: 'Em vez de continuar preso a bloqueios, você pode resolver isso com uma opção focada em rapidez, ativação prática e uso estável.',
  f1t: 'Ativação rápida', f1d: 'Processo simples para voltar a usar sem enrolação.',
  f2t: 'Fácil de seguir',  f2d: 'Feito para resolver logo, sem complicação desnecessária.',
  f3t: 'Suporte incluso',   f3d: 'Ajuda disponível caso precise durante o processo.',
  f4t: 'Entrega imediata',  f4d: 'Receba rápido para não ficar travado por mais tempo.',
  cta3: 'QUERO RESOLVER AGORA',
  ctaBadge: 'Acesso rápido',
  ctaH2: 'Pare de perder tempo com Office travado',
  ctaPara: 'Recupere o acesso aos aplicativos e volte a usar Word, Excel e PowerPoint com praticidade.',
  ctaBtn: 'ATIVAR MEU OFFICE AGORA',
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
  <div class="min-h-screen bg-white text-slate-900">
    <section class="border-b border-slate-200 bg-slate-50">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          {{ ui.topBadge }}
        </div>
        <div class="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-red-200">
          {{ ui.topTag }}
        </div>
      </div>
    </section>

    <section class="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.12),_transparent_30%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
      <div class="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div class="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <div class="inline-flex rounded-full bg-red-50 px-4 py-1 text-sm font-semibold text-red-700 ring-1 ring-red-200">
              {{ ui.heroBadge }}
            </div>

            <h1 class="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
              {{ ui.h1 }}
            </h1>

            <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              {{ ui.heroPara }}
            </p>

            <div class="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive"
                class="inline-flex min-h-[58px] items-center justify-center rounded-2xl bg-green-600 px-8 text-lg font-extrabold text-white shadow-[0_14px_30px_rgba(22,163,74,0.28)] transition hover:scale-[1.02] hover:bg-green-700"
              >
                {{ ui.cta1 }}
              </a>

              <div class="inline-flex min-h-[58px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 shadow-sm">
                {{ ui.cta2 }}
              </div>
            </div>
          </div>

          <div class="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div class="rounded-2xl bg-slate-950 p-5 text-white">
              <div class="text-sm font-semibold text-slate-300">{{ ui.signalsTitle }}</div>
              <ul class="mt-4 space-y-3 text-sm md:text-base">
                <li class="flex items-start gap-3">
                  <span class="text-red-400">✖</span>
                  <span>{{ ui.s1 }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-red-400">✖</span>
                  <span>{{ ui.s2 }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-red-400">✖</span>
                  <span>{{ ui.s3 }}</span>
                </li>
              </ul>
            </div>

            <div class="mt-5 rounded-2xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
              {{ ui.signalsNote }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-14 md:py-20">
      <div class="mx-auto max-w-6xl px-4 md:px-6">
        <div class="grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center">
          <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-7 shadow-sm">
            <div class="inline-flex rounded-full bg-white px-4 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              {{ ui.probBadge }}
            </div>

            <h2 class="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              {{ ui.probH2 }}
            </h2>

            <p class="mt-4 text-lg leading-8 text-slate-600">
              {{ ui.probPara }}
            </p>

            <ul class="mt-6 space-y-3 text-slate-700">
              <li class="flex items-start gap-3">
                <span class="mt-1 text-red-600">•</span>
                <span>{{ ui.prob1 }}</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-1 text-red-600">•</span>
                <span>{{ ui.prob2 }}</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-1 text-red-600">•</span>
                <span>{{ ui.prob3 }}</span>
              </li>
            </ul>
          </div>

          <div>
            <div class="inline-flex rounded-full bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700 ring-1 ring-blue-200">
              {{ ui.solBadge }}
            </div>

            <h2 class="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              {{ ui.solH2 }}
            </h2>

            <p class="mt-5 text-lg leading-8 text-slate-600">
              {{ ui.solPara }}
            </p>

            <div class="mt-8 grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="text-2xl">⚡</div>
                <h3 class="mt-3 text-lg font-bold">{{ ui.f1t }}</h3>
                <p class="mt-2 text-slate-600">{{ ui.f1d }}</p>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="text-2xl">🧩</div>
                <h3 class="mt-3 text-lg font-bold">{{ ui.f2t }}</h3>
                <p class="mt-2 text-slate-600">{{ ui.f2d }}</p>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="text-2xl">🛟</div>
                <h3 class="mt-3 text-lg font-bold">{{ ui.f3t }}</h3>
                <p class="mt-2 text-slate-600">{{ ui.f3d }}</p>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="text-2xl">📦</div>
                <h3 class="mt-3 text-lg font-bold">{{ ui.f4t }}</h3>
                <p class="mt-2 text-slate-600">{{ ui.f4d }}</p>
              </div>
            </div>

            <a
              href="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive"
              class="mt-8 inline-flex min-h-[58px] items-center justify-center rounded-2xl bg-blue-600 px-8 text-lg font-extrabold text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)] transition hover:scale-[1.01] hover:bg-blue-700"
            >
              {{ ui.cta3 }}
            </a>
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
          {{ ui.ctaPara }}
        </p>

        <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive"
            class="inline-flex min-h-[60px] items-center justify-center rounded-2xl bg-red-600 px-10 text-lg font-extrabold text-white shadow-[0_16px_34px_rgba(220,38,38,0.35)] transition hover:scale-[1.02] hover:bg-red-700"
          >
            {{ ui.ctaBtn }}
          </a>
        </div>

        <p class="mt-4 text-sm text-slate-400">
          {{ ui.ctaNote }}
        </p>
      </div>
    </section>
  </div>
</template>