/**
 * tracking.client.ts - Plugin para tracking de page view
 * Dispara trackPageView() no hook page:finish
 */

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const { trackPageView } = useTracking()

  // Dispara page view quando a página termina de carregar
  const router = useRouter()
  
  router.afterEach(() => {
    // Pequeno delay para garantir que o DOM esteja pronto
    setTimeout(() => {
      console.log('[tracking] Disparando page view após navegação')
      trackPageView()
    }, 100)
  })

  // Dispara page view na carga inicial
  onMounted(() => {
    setTimeout(() => {
      console.log('[tracking] Disparando page view na carga inicial')
      trackPageView()
    }, 100)
  })
})
