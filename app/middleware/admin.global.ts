import { navigateTo, useNuxtApp } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) return

  if (to.path === '/admin/login') return

  if (import.meta.server) return

  const { $fetch } = useNuxtApp()

  return $fetch('/api/admin/auth/me')
    .then(() => undefined)
    .catch(() => navigateTo('/admin/login'))
})
