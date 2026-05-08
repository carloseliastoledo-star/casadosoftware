import { navigateTo, useNuxtApp } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) return

  if (to.path === '/admin/login') return

  const { $fetch } = useNuxtApp()

  if (import.meta.server) {
    const headers = useRequestHeaders(['cookie'])
    return $fetch('/api/admin/auth/me', { headers })
      .then(() => undefined)
      .catch(() => navigateTo('/admin/login'))
  }

  return $fetch('/api/admin/auth/me')
    .then(() => undefined)
    .catch(() => navigateTo('/admin/login'))
})
