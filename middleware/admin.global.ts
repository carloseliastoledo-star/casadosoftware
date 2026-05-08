import { navigateTo, useNuxtApp } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  console.log('[middleware admin.global] Checking route:', to.path)
  
  if (!to.path.startsWith('/admin')) return

  if (to.path === '/admin/login') return

  const { $fetch } = useNuxtApp()

  if (import.meta.server) {
    const headers = useRequestHeaders(['cookie'])
    return $fetch('/api/admin/auth/me', { headers })
      .then(() => {
        console.log('[middleware admin.global] Auth OK for:', to.path)
        return undefined
      })
      .catch((err) => {
        console.log('[middleware admin.global] Auth FAILED for:', to.path, err)
        return navigateTo('/admin/login')
      })
  }

  return $fetch('/api/admin/auth/me')
    .then(() => {
      console.log('[middleware admin.global] Auth OK for:', to.path)
      return undefined
    })
    .catch((err) => {
      console.log('[middleware admin.global] Auth FAILED for:', to.path, err)
      return navigateTo('/admin/login')
    })
})
