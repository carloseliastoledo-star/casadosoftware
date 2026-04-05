<template>
  <div class="min-h-screen flex bg-gray-100">

    <!-- SIDEBAR -->
    <aside
      class="w-64 bg-[#1d2327] text-gray-200 fixed inset-y-0 z-50 flex flex-col min-h-0 h-screen overflow-hidden"
      :class="sidebarOpen ? 'block' : 'hidden md:block'"
    >

      <div class="p-4 text-lg font-bold border-b border-gray-700">
        {{ siteName }}
      </div>

      <nav class="p-4 space-y-1 text-sm flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-64px)]">

        <NuxtLink to="/admin" class="menu">
          📊 Dashboard
        </NuxtLink>

        <NuxtLink to="/admin/produtos" class="menu">
          🛒 Produtos
        </NuxtLink>

        <NuxtLink to="/admin/licenses" class="menu">
          🔑 Licenças
        </NuxtLink>

        <NuxtLink to="/admin/pedidos" class="menu">
          📦 Pedidos
        </NuxtLink>

        <NuxtLink to="/admin/clientes" class="menu">
          👤 Clientes
        </NuxtLink>

        <NuxtLink to="/admin/categorias" class="menu">
          🗂️ Categorias
        </NuxtLink>

        <NuxtLink to="/admin/importar-woocommerce" class="menu">
          🔄 Importar WooCommerce
        </NuxtLink>

        <NuxtLink to="/admin/cupons" class="menu">
          🏷️ Cupons
        </NuxtLink>

        <NuxtLink to="/admin/tutoriais" class="menu">
          📘 Tutoriais
        </NuxtLink>

        <NuxtLink to="/admin/paginas" class="menu">
          📄 Páginas
        </NuxtLink>

        <NuxtLink to="/admin/blog" class="menu">
          📝 Blog
        </NuxtLink>

        <NuxtLink to="/admin/seo-pages" class="menu">
          🎯 SEO Pages
        </NuxtLink>

        <NuxtLink to="/admin/afiliados" class="menu">
          🤝 Afiliados
        </NuxtLink>

        <NuxtLink to="/admin/inscricoes-afiliados" class="menu">
          📨 Inscrições (Afiliados)
        </NuxtLink>

        <NuxtLink to="/admin/saques-afiliados" class="menu">
          💸 Saques Afiliados
        </NuxtLink>

        <NuxtLink to="/admin/configuracoes" class="menu">
          ⚙️ Configurações
        </NuxtLink>

      </nav>
    </aside>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/40 z-40 md:hidden"
      @click="sidebarOpen = false"
    />

    <!-- ÁREA DIREITA -->
    <div class="flex-1 md:ml-64 flex flex-col">

      <!-- TOPBAR -->
      <header class="h-14 bg-white border-b flex items-center justify-between px-4 md:px-6">

        <div class="flex items-center gap-3">
          <button
            type="button"
            class="md:hidden text-gray-700"
            @click="sidebarOpen = true"
          >
            ☰
          </button>

          <div class="text-sm text-gray-600">
            Painel Administrativo
          </div>
        </div>

        <button
          @click="logout"
          class="text-sm text-red-600 hover:underline"
        >
          Sair
        </button>

      </header>

      <!-- CONTEÚDO -->
      <main class="flex-1 p-4 md:p-8">
        <slot />
      </main>

    </div>

  </div>
</template>

<script setup>
const { siteName } = useSiteBranding()

const sidebarOpen = ref(false)

async function logout() {
  try {
    await $fetch('/api/admin/auth/logout', { method: 'POST' })
  } finally {
    navigateTo('/admin/login')
  }
}
</script>

<style scoped>
.menu {
  display: block;
  padding: 10px 12px;
  border-radius: 6px;
  transition: 0.2s;
}

.menu:hover {
  background: #2c3338;
}
</style>
