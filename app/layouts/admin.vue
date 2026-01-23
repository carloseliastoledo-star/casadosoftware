<template>
  <div class="min-h-screen flex bg-gray-100">

    <!-- SIDEBAR -->
    <aside class="w-64 bg-[#1d2327] text-gray-200 fixed h-screen z-50">

      <div class="p-4 text-lg font-bold border-b border-gray-700">
        Casa do Software
      </div>

      <nav class="p-4 space-y-1 text-sm">

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

        <NuxtLink to="/admin/cupons" class="menu">
          🏷️ Cupons
        </NuxtLink>

        <NuxtLink to="/admin/tutoriais" class="menu">
          📘 Tutoriais
        </NuxtLink>

        <NuxtLink to="/admin/paginas" class="menu">
          📄 Páginas
        </NuxtLink>

        <NuxtLink to="/admin/configuracoes" class="menu">
          ⚙️ Configurações
        </NuxtLink>

      </nav>
    </aside>

    <!-- ÁREA DIREITA -->
    <div class="flex-1 ml-64 flex flex-col">

      <!-- TOPBAR -->
      <header class="h-14 bg-white border-b flex items-center justify-between px-6">

        <div class="text-sm text-gray-600">
          Painel Administrativo
        </div>

        <button
          @click="logout"
          class="text-sm text-red-600 hover:underline"
        >
          Sair
        </button>

      </header>

      <!-- CONTEÚDO -->
      <main class="flex-1 p-8">
        <slot />
      </main>

    </div>

  </div>
</template>

<script setup>
async function logout() {
  await $fetch('/api/admin/auth/logout', { method: 'POST' })
  navigateTo('/admin/login')
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
