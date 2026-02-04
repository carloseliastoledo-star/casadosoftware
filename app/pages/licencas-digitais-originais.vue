<template>
  <div class="bg-gray-50 min-h-screen">
    <section class="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-700 to-indigo-900 text-white">
      <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(circle at 25% 20%, rgba(255,255,255,.35), transparent 45%), radial-gradient(circle at 80% 30%, rgba(255,255,255,.20), transparent 40%);" />

      <div class="relative max-w-6xl mx-auto px-6 py-20">
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
        <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">Por que escolher a Casa do Software?</h2>
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
              <NuxtLink to="/entrega-digital" class="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition">
                Entrega Digital
              </NuxtLink>
              <NuxtLink to="/reembolso" class="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition">
                Política de Reembolso
              </NuxtLink>
              <NuxtLink to="/privacidade" class="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition">
                Privacidade
              </NuxtLink>
              <NuxtLink to="/termos" class="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition">
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
            <NuxtLink to="/quem-somos" class="mt-5 inline-flex items-center justify-center w-full bg-white text-gray-900 font-extrabold px-5 py-3 rounded-xl hover:bg-gray-100 transition">
              Ver Contato
            </NuxtLink>
            <div class="mt-4 text-xs text-white/70">Eletrokeys LTDA — CNPJ 44.694.365/0001-48</div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto pb-16 px-6">
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">Pronto para escolher sua licença?</h2>
            <p class="mt-3 text-gray-600">
              Veja a lista completa de licenças disponíveis.
            </p>
          </div>
          <div class="flex md:justify-end">
            <NuxtLink
              to="/produtos"
              class="inline-flex items-center justify-center w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-7 py-3 rounded-xl transition"
            >
              Ver Licenças
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })
</script>

<style scoped>
.btn {
  @apply inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-extrabold transition;
}
</style>
