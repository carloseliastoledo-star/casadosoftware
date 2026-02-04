<template>
  <div class="bg-gray-50 min-h-screen">

    <section class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div class="max-w-6xl mx-auto text-center px-4">
        <h1 class="text-4xl font-bold mb-4">
          Licenças Digitais Originais
        </h1>
        <p class="text-lg opacity-90">
          Ativação legal, suporte ao cliente e transparência.
        </p>

        <NuxtLink
          to="/produtos"
          class="mt-6 inline-block bg-white text-blue-700 font-bold px-6 py-3 rounded-lg shadow"
        >
          Ver Licenças
        </NuxtLink>
      </div>
    </section>

    <section class="max-w-6xl mx-auto py-16 px-4">
      <h2 class="text-2xl font-bold text-center mb-10">
        Por que escolher a Casa do Software?
      </h2>

      <div class="grid md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-xl shadow text-center">
          <h3 class="font-bold text-blue-700">Ativação Oficial</h3>
          <p class="text-sm text-gray-600 mt-2">
            Validação nos servidores do fabricante.
          </p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow text-center">
          <h3 class="font-bold text-blue-700">Entrega Digital</h3>
          <p class="text-sm text-gray-600 mt-2">
            Envio rápido por e-mail.
          </p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow text-center">
          <h3 class="font-bold text-blue-700">Suporte</h3>
          <p class="text-sm text-gray-600 mt-2">
            Auxílio na instalação e ativação.
          </p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow text-center">
          <h3 class="font-bold text-blue-700">Transparência</h3>
          <p class="text-sm text-gray-600 mt-2">
            Informações claras e nota fiscal.
          </p>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto py-16 px-4">
      <h2 class="text-2xl font-bold text-center mb-10">
        Licenças em Destaque
      </h2>

      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-xl shadow text-center">
          <div class="h-32 flex items-center justify-center mb-4 text-5xl">🪟</div>
          <h3 class="font-bold">Windows 11 Pro</h3>
          <p class="text-blue-600 font-bold text-xl mt-2">R$ 89</p>
          <NuxtLink to="/produto/windows-11-pro" class="btn">
            Ver Detalhes
          </NuxtLink>
        </div>

        <div class="bg-white p-6 rounded-xl shadow text-center">
          <div class="h-32 flex items-center justify-center mb-4 text-5xl">📦</div>
          <h3 class="font-bold">Office 2021 Pro</h3>
          <p class="text-blue-600 font-bold text-xl mt-2">R$ 119</p>
          <NuxtLink to="/produto/office-2021" class="btn">
            Ver Detalhes
          </NuxtLink>
        </div>

        <div class="bg-white p-6 rounded-xl shadow text-center">
          <div class="h-32 flex items-center justify-center mb-4 text-5xl">🎁</div>
          <h3 class="font-bold">Combo Windows + Office</h3>
          <p class="text-blue-600 font-bold text-xl mt-2">R$ 149</p>
          <NuxtLink to="/produto/combo" class="btn">
            Ver Detalhes
          </NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.btn {
  @apply inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg;
}
</style>
