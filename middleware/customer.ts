import { navigateTo, useNuxtApp } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/minha-conta')) return

  if (to.path === '/minha-conta/login') return

  if (import.meta.client) {
    const { $fetch } = useNuxtApp()

    return $fetch('/api/customer/auth/me')
      .then(() => undefined)
      .catch(() => navigateTo('/minha-conta/login'))
  }
})
