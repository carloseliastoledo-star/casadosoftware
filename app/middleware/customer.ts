import { navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/minha-conta')) return

  if (to.path === '/minha-conta/login') return
  if (to.path === '/minha-conta/esqueci-senha') return
  if (to.path === '/minha-conta/reset') return

  if (import.meta.client) {
    try {
      await $fetch('/api/customer/auth/me')
      return
    } catch {
      return navigateTo('/minha-conta/login')
    }
  }
})
