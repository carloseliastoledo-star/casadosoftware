<script setup>
definePageMeta({
  layout: 'lp'
})

useSeoMeta({
  title: 'Seu Office 365 Expirou? Ative Agora | Casa do Software',
  description: 'Recupere o acesso ao Word, Excel e PowerPoint com ativação rápida, entrega imediata e suporte.',
  robots: 'noindex, nofollow'
})

const productUrl = '/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive'
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] text-slate-900">
    <!-- HERO -->
    <section class="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.10),_transparent_35%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div class="relative mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
        <div class="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700 shadow-sm">
              <span>⚠</span>
              <span>Licença expirada detectada</span>
            </div>

            <h1 class="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
              Seu Office 365 Expirou?
            </h1>

            <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              Recupere agora o acesso ao Word, Excel e PowerPoint com uma solução rápida, prática e sem complicação.
            </p>

            <div class="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                :href="productUrl"
                class="inline-flex min-h-[58px] items-center justify-center rounded-2xl bg-green-600 px-8 text-lg font-extrabold text-white shadow-[0_14px_30px_rgba(22,163,74,0.28)] transition hover:scale-[1.02] hover:bg-green-700"
              >
                ATIVAR AGORA COM DESCONTO
              </a>

              <div class="inline-flex min-h-[58px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 shadow-sm">
                Entrega imediata • Suporte incluso
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-3 text-sm font-medium text-slate-600">
              <span class="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">✔ Windows</span>
              <span class="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">✔ Mac</span>
              <span class="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">✔ Android</span>
              <span class="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">✔ iPhone/iPad</span>
            </div>
          </div>

          <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)]">
            <div class="rounded-3xl bg-slate-950 p-6 text-white">
              <div class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Resultado esperado
              </div>
              <h2 class="mt-3 text-3xl font-black leading-tight">
                Office ativo novamente em poucos minutos
              </h2>
              <p class="mt-3 text-slate-300">
                Volte a usar seus aplicativos normalmente e sem perder tempo com bloqueios e avisos de expiração.
              </p>
            </div>

            <div class="mt-5 space-y-3">
              <div class="rounded-2xl bg-green-50 px-4 py-3 text-green-800 ring-1 ring-green-200">
                ✔ Processo simples e rápido
              </div>
              <div class="rounded-2xl bg-blue-50 px-4 py-3 text-blue-800 ring-1 ring-blue-200">
                ✔ Ativação prática
              </div>
              <div class="rounded-2xl bg-amber-50 px-4 py-3 text-amber-800 ring-1 ring-amber-200">
                ✔ Suporte durante o processo
              </div>
            </div>

            <a
              :href="productUrl"
              class="mt-6 inline-flex min-h-[58px] w-full items-center justify-center rounded-2xl bg-blue-600 px-6 text-center text-lg font-extrabold text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)] transition hover:scale-[1.01] hover:bg-blue-700"
            >
              QUERO RESOLVER AGORA
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- SINTOMAS -->
    <section class="py-14 md:py-20">
      <div class="mx-auto max-w-6xl px-4 md:px-6">
        <div class="text-center">
          <div class="inline-flex rounded-full bg-red-50 px-4 py-1 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            Sinais mais comuns
          </div>
          <h2 class="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
            Está vendo algum destes avisos?
          </h2>
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="text-3xl">❌</div>
            <h3 class="mt-4 text-lg font-bold">Produto não licenciado</h3>
            <p class="mt-2 text-slate-600">
              O Office mostra aviso de expiração ou bloqueio.
            </p>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="text-3xl">📄</div>
            <h3 class="mt-4 text-lg font-bold">Arquivos bloqueados</h3>
            <p class="mt-2 text-slate-600">
              Dificuldade para editar ou salvar documentos normalmente.
            </p>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="text-3xl">🔒</div>
            <h3 class="mt-4 text-lg font-bold">Uso limitado</h3>
            <p class="mt-2 text-slate-600">
              Word, Excel ou PowerPoint funcionando com restrições.
            </p>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="text-3xl">💳</div>
            <h3 class="mt-4 text-lg font-bold">Pedido para renovar</h3>
            <p class="mt-2 text-slate-600">
              Cobranças ou mensagens para continuar usando.
            </p>
          </div>
        </div>

        <p class="mt-8 text-center text-xl font-bold text-red-600">
          Isso indica que a ativação anterior deixou de funcionar.
        </p>
      </div>
    </section>

    <!-- COMO FUNCIONA -->
    <section class="bg-white py-14 md:py-20">
      <div class="mx-auto max-w-6xl px-4 md:px-6">
        <div class="grid gap-10 md:grid-cols-2 md:items-center">
          <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div class="inline-flex rounded-full bg-white px-4 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              Como funciona
            </div>

            <h2 class="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Resolva em menos de 5 minutos
            </h2>

            <div class="mt-8 space-y-5">
              <div class="flex gap-4">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">1</div>
                <div>
                  <h3 class="font-bold text-slate-900">Acesse a solução</h3>
                  <p class="mt-1 text-slate-600">Entre na página do produto e finalize com rapidez.</p>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">2</div>
                <div>
                  <h3 class="font-bold text-slate-900">Receba imediatamente</h3>
                  <p class="mt-1 text-slate-600">Tenha acesso rápido para não ficar travado.</p>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">3</div>
                <div>
                  <h3 class="font-bold text-slate-900">Volte a usar normalmente</h3>
                  <p class="mt-1 text-slate-600">Recupere Word, Excel e PowerPoint com praticidade.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div class="inline-flex rounded-full bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700 ring-1 ring-blue-200">
              Vantagens
            </div>

            <h2 class="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Feito para quem quer resolver logo
            </h2>

            <div class="mt-8 grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="text-2xl">⚡</div>
                <h3 class="mt-3 text-lg font-bold">Agilidade</h3>
                <p class="mt-2 text-slate-600">Processo direto para voltar a usar os apps.</p>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="text-2xl">🛡️</div>
                <h3 class="mt-3 text-lg font-bold">Suporte</h3>
                <p class="mt-2 text-slate-600">Ajuda disponível durante a ativação.</p>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="text-2xl">💸</div>
                <h3 class="mt-3 text-lg font-bold">Economia</h3>
                <p class="mt-2 text-slate-600">Alternativa prática para evitar cobranças recorrentes.</p>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="text-2xl">✅</div>
                <h3 class="mt-3 text-lg font-bold">Simplicidade</h3>
                <p class="mt-2 text-slate-600">Sem distrações, com foco total na conversão.</p>
              </div>
            </div>

            <a
              :href="productUrl"
              class="mt-8 inline-flex min-h-[58px] items-center justify-center rounded-2xl bg-green-600 px-8 text-lg font-extrabold text-white shadow-[0_14px_30px_rgba(22,163,74,0.28)] transition hover:scale-[1.01] hover:bg-green-700"
            >
              ATIVAR AGORA
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- PROVA -->
    <section class="py-14 md:py-20">
      <div class="mx-auto max-w-6xl px-4 md:px-6">
        <div class="text-center">
          <div class="inline-flex rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-700">
            Prova social
          </div>
          <h2 class="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
            Mais confiança na decisão
          </h2>
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-3">
          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="text-yellow-500">★★★★★</div>
            <p class="mt-4 text-slate-700">
              “Funcionou rápido e consegui voltar a usar tudo sem dor de cabeça.”
            </p>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="text-yellow-500">★★★★★</div>
            <p class="mt-4 text-slate-700">
              “Processo simples e suporte muito útil durante a ativação.”
            </p>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="text-yellow-500">★★★★★</div>
            <p class="mt-4 text-slate-700">
              “Melhor do que continuar preso a mensalidade e bloqueio.”
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="bg-slate-950 py-14 text-white md:py-20">
      <div class="mx-auto max-w-5xl px-4 text-center md:px-6">
        <div class="inline-flex rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-white/90 ring-1 ring-white/10">
          Oferta em destaque
        </div>

        <h2 class="mt-4 text-3xl font-black tracking-tight md:text-5xl">
          Ative seu Office agora e volte a usar normalmente
        </h2>

        <p class="mx-auto mt-5 max-w-3xl text-lg text-slate-300">
          Se o seu acesso expirou, resolva agora em uma landing page limpa, premium e focada em clique.
        </p>

        <a
          :href="productUrl"
          class="mt-8 inline-flex min-h-[60px] items-center justify-center rounded-2xl bg-red-600 px-10 text-lg font-extrabold text-white shadow-[0_16px_34px_rgba(220,38,38,0.35)] transition hover:scale-[1.02] hover:bg-red-700"
        >
          ATIVAR COM DESCONTO
        </a>

        <p class="mt-4 text-sm text-slate-400">
          Entrega imediata • Ativação simples • Suporte incluso
        </p>
      </div>
    </section>
  </div>
</template>