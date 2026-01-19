<template>
  <div class="min-h-screen flex flex-col bg-white">

    <!-- HEADER -->
    <header class="border-b bg-white">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <!-- LOGO -->
        <NuxtLink to="/" class="text-2xl font-bold text-blue-600">
          Casa do Software
        </NuxtLink>

        <!-- MENU -->
        <nav class="flex items-center gap-6 text-sm font-medium text-gray-700">
          <NuxtLink to="/" class="hover:text-blue-600">
            Início
          </NuxtLink>

          <NuxtLink to="/produtos" class="hover:text-blue-600">
            Produtos
          </NuxtLink>

          <NuxtLink to="/tutoriais" class="hover:text-blue-600">
            Tutoriais
          </NuxtLink>

          <NuxtLink
            to="/checkout"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Carrinho
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- CONTEÚDO DAS PÁGINAS -->
    <main class="flex-1">
      <NuxtPage />
    </main>

    <!-- FOOTER -->
    <footer class="bg-gray-100 border-t mt-20">
      <div class="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm text-gray-600">

        <div>
          <h3 class="font-semibold text-gray-800 mb-2">Casa do Software</h3>
          <p>
            Licenças digitais originais de Windows e Office com entrega imediata.
          </p>
        </div>

        <div>
          <h3 class="font-semibold text-gray-800 mb-2">Links</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/produtos" class="hover:text-blue-600">Produtos</NuxtLink></li>
            <li><NuxtLink to="/tutoriais" class="hover:text-blue-600">Tutoriais</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h3 class="font-semibold text-gray-800 mb-2">Suporte</h3>
          <p>Atendimento rápido e especializado</p>
          <p class="mt-2 font-medium text-gray-800">
            suporte@casadosoftware.com
          </p>
        </div>
      </div>

      <div class="text-center text-xs text-gray-500 py-4 border-t">
        © {{ new Date().getFullYear() }} Casa do Software — Todos os direitos reservados.
      </div>
    </footer>

  </div>
</template>
