<template>
  <div class="min-h-screen flex flex-col bg-white">

    <!-- HEADER -->
    <header class="border-b bg-white sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
        <!-- LOGO -->
        <NuxtLink to="/" class="flex items-center gap-3">
          <img
            src="/logo-casa-do-software.png"
            alt="Casa do Software"
            class="h-11 md:h-14 w-auto"
          />
          <span class="text-lg font-extrabold tracking-tight text-gray-900">
            Casa do Software
          </span>
        </NuxtLink>

        <!-- MENU -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
          <NuxtLink to="/produtos" class="hover:text-blue-600">
            Produtos
          </NuxtLink>

          <NuxtLink to="/tutoriais" class="hover:text-blue-600">
            Tutoriais
          </NuxtLink>

          <NuxtLink to="/minha-conta/login" class="hover:text-blue-600">
            Minha conta
          </NuxtLink>

          <NuxtLink
            to="/checkout"
            class="relative inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
          >
            <span class="font-semibold">Carrinho</span>
            <span
              v-if="cartCount > 0"
              class="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center"
            >
              {{ cartCount }}
            </span>
          </NuxtLink>
        </nav>

        <div class="md:hidden flex items-center gap-3">
          <NuxtLink
            to="/minha-conta/login"
            class="text-sm font-semibold text-gray-700 hover:text-blue-600"
          >
            Conta
          </NuxtLink>
          <NuxtLink
            to="/checkout"
            class="relative inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
          >
            Carrinho
            <span
              v-if="cartCount > 0"
              class="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center"
            >
              {{ cartCount }}
            </span>
          </NuxtLink>
        </div>
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
            <li><NuxtLink to="/quem-somos" class="hover:text-blue-600">Quem somos</NuxtLink></li>
            <li><NuxtLink to="/entrega-digital" class="hover:text-blue-600">Entrega digital</NuxtLink></li>
            <li><NuxtLink to="/reembolso" class="hover:text-blue-600">Política de reembolso</NuxtLink></li>
            <li><NuxtLink to="/privacidade" class="hover:text-blue-600">Privacidade</NuxtLink></li>
            <li><NuxtLink to="/termos" class="hover:text-blue-600">Termos de uso</NuxtLink></li>
            <li v-for="p in paginas" :key="p.slug">
              <NuxtLink :to="`/paginas/${p.slug}`" class="hover:text-blue-600">{{ p.titulo }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="font-semibold text-gray-800 mb-2">Suporte</h3>
          <p>Atendimento rápido e especializado</p>
          <p class="mt-2 font-medium text-gray-800">
            suporte@casadosoftware.com
          </p>
          <p class="mt-2 text-xs text-gray-500">
            Eletrokeys LTDA — CNPJ 44.694.365/0001-48
          </p>
        </div>
      </div>

      <div class="text-center text-xs text-gray-500 py-4 border-t">
        © {{ new Date().getFullYear() }} Casa do Software — Todos os direitos reservados.
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
type PaginaLinkDto = {
  titulo: string
  slug: string
}

const { cart } = useCart()

const { data } = await useFetch<{ ok: true; paginas: PaginaLinkDto[] }>('/api/paginas', {
  server: true
})

const paginas = computed(() => data.value?.paginas || [])

const cartCount = computed(() => (cart.value || []).length)
</script>
