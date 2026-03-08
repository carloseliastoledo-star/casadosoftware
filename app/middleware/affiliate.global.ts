import { navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  const rawPath = String(to.path || '')
  const langs = ['pt', 'en', 'es', 'fr', 'it', 'de']
  const parts = rawPath.split('/').filter(Boolean)

  const maybeLang = parts[0] && langs.includes(parts[0]) ? parts[0] : null
  const prefix = maybeLang ? `/${maybeLang}` : ''
  const pathNoPrefix = maybeLang ? `/${parts.slice(1).join('/')}` : rawPath

  if (!pathNoPrefix.startsWith('/affiliate')) return

  const loginPath = `${prefix}/affiliate/login`
  const activatePath = `${prefix}/affiliate/ativar`
  if (rawPath === loginPath) return
  if (rawPath === activatePath) return

  if (import.meta.server) {
    const headers = useRequestHeaders(['cookie'])
    const requestFetch = useRequestFetch()
    try {
      await requestFetch('/api/affiliate/me', { headers })
      return
    } catch {
      return navigateTo(loginPath)
    }
  }

  try {
    await $fetch('/api/affiliate/me')
    return
  } catch {
    return navigateTo(loginPath)
  }
})
