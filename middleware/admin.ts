export default defineNuxtRouteMiddleware((to) => {
  // Só protege rotas /admin
  if (to.path.startsWith('/admin')) {

    // Libera a página de login
    if (to.path === '/admin/login') return

    // Roda apenas no navegador
    if (import.meta.client) {
      const token = localStorage.getItem('admin_token')

      // Se não estiver logado → joga pro login
      if (!token) {
        return navigateTo('/admin/login')
      }
    }
  }
})
