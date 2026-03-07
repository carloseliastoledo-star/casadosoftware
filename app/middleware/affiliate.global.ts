import { navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/affiliate')) return

  if (to.path === '/affiliate/login') return
  if (to.path === '/affiliate/ativar') return

  if (import.meta.server) {
    const headers = useRequestHeaders(['cookie'])
    const requestFetch = useRequestFetch()
    try {
      await requestFetch('/api/affiliate/me', { headers })
      return
    } catch {
      return navigateTo('/affiliate/login')
    }
  }

  try {
    await $fetch('/api/affiliate/me')
    return
  } catch {
    return navigateTo('/affiliate/login')
  }
})
