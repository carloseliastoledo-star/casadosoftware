export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.client) return

  const params = new URLSearchParams(window.location.search)

  if (params.get('utm_source')) {
    localStorage.setItem('utm_data', window.location.search)
  }
})
