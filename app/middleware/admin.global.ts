import { navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return

  if (to.path === '/admin/login') return

  let user: any = null

  if (import.meta.server) {
    const headers = useRequestHeaders(['cookie'])
    const requestFetch = useRequestFetch()
    try {
      user = await requestFetch('/api/admin/auth/me', { headers })
      return
    } catch {
      return navigateTo('/admin/login')
    }
  }

  try {
    user = await $fetch('/api/admin/auth/me')
  } catch {
    return navigateTo('/admin/login')
  }

  // Agentes só podem acessar páginas de chat
  if (user && user.role === 'agent') {
    const allowedPaths = ['/admin/atendimentos', '/admin/atendimento-detalhes']
    const isAllowed = allowedPaths.some(path => to.path.startsWith(path))
    if (!isAllowed) {
      return navigateTo('/admin/atendimentos')
    }
  }

  return
})
