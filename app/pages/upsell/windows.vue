<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <section class="relative overflow-hidden border-b border-white/10">
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.12),_transparent_35%)]"
        aria-hidden="true"
      />
      <div class="relative mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <span
          class="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1 text-sm font-bold text-emerald-300"
        >
          Compra confirmada
        </span>

        <h1 class="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          Antes de sair, aproveite esta oferta exclusiva
        </h1>

        <p class="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Adicione o Windows 11 por um valor especial disponível somente agora.
        </p>

        <div
          class="mx-auto mt-8 flex max-w-md flex-col items-center rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-2xl"
        >
          <p class="text-sm text-slate-400 line-through">De R$ 149,90</p>
          <div class="mt-1 flex items-end gap-2">
            <span class="text-5xl font-black text-emerald-400">R$ 19,90</span>
          </div>
          <p class="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
            Oferta única de pós-compra
          </p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-xl">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
              W
            </div>
            <div>
              <h2 class="text-2xl font-black">Windows 11 Pro</h2>
              <p class="text-sm text-slate-500">Licença digital com entrega rápida</p>
            </div>
          </div>

          <div class="mt-6 grid gap-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p class="font-bold">Ativação rápida</p>
              <p class="mt-1 text-sm text-slate-600">Receba e ative em poucos minutos.</p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p class="font-bold">Ideal para uso profissional</p>
              <p class="mt-1 text-sm text-slate-600">Mais recursos e melhor experiência no dia a dia.</p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p class="font-bold">Entrega digital</p>
              <p class="mt-1 text-sm text-slate-600">Sem espera por envio físico.</p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p class="font-bold">Oferta exclusiva</p>
              <p class="mt-1 text-sm text-slate-600">Esse valor aparece somente após a compra.</p>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <h3 class="text-2xl font-black">Complete seu setup agora</h3>
          <p class="mt-3 text-slate-300">
            Você já garantiu seu produto principal. Agora pode adicionar o Windows com desconto especial
            sem precisar começar tudo de novo.
          </p>

          <div class="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-4">
            <p class="text-sm font-bold text-emerald-300">
              Oferta temporária: adicione agora por apenas R$ 19,90
            </p>
          </div>

          <div class="mt-6 space-y-3 text-sm text-slate-300">
            <div class="flex items-start gap-3">
              <span class="mt-0.5 text-emerald-400">✔</span>
              <span>Compra segura</span>
            </div>
            <div class="flex items-start gap-3">
              <span class="mt-0.5 text-emerald-400">✔</span>
              <span>Entrega imediata após confirmação</span>
            </div>
            <div class="flex items-start gap-3">
              <span class="mt-0.5 text-emerald-400">✔</span>
              <span>Suporte ao cliente incluso</span>
            </div>
          </div>

          <div class="mt-8 flex flex-col gap-3">
            <a
              :href="upsellCheckoutUrl"
              class="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 py-4 text-center text-lg font-black text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400"
            >
              SIM, QUERO ADICIONAR WINDOWS
            </a>

            <NuxtLink
              to="/obrigado"
              class="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center text-base font-bold text-slate-200 transition hover:bg-white/10"
            >
              Não, obrigado
            </NuxtLink>
          </div>

          <p class="mt-4 text-center text-xs text-slate-400">
            Esta oferta não aparecerá novamente após sair desta página.
          </p>
        </div>
      </div>
    </section>

    <section class="border-t border-white/10 bg-slate-900/60">
      <div class="mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 lg:px-8">
        <h4 class="text-xl font-black">Pergunta rápida</h4>
        <p class="mx-auto mt-3 max-w-2xl text-slate-300">
          Quer deixar seu computador completo agora, aproveitando um valor reduzido e sem perder tempo depois?
        </p>

        <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            :href="upsellCheckoutUrl"
            class="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 font-black text-white transition hover:bg-blue-700"
          >
            QUERO APROVEITAR A OFERTA
          </a>

          <NuxtLink
            to="/obrigado"
            class="inline-flex items-center justify-center rounded-2xl border border-white/10 px-6 py-4 font-bold text-slate-200 transition hover:bg-white/5"
          >
            Pular esta oferta
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Oferta exclusiva pós-compra | Casa do Software',
  description: 'Aproveite uma oferta especial de pós-compra com entrega digital e ativação rápida.',
  robots: 'noindex,nofollow',
})

/**
 * Troque pelo seu link real do checkout do upsell.
 * Pode ser Mercado Pago, Stripe, Pagar.me ou rota interna.
 */
const upsellCheckoutUrl = 'https://mpago.la/SEU_LINK_DO_UPSELL'
</script>