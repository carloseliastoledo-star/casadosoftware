/**
 * site-settings plugin - Carrega dados do SiteSettings do banco e disponibiliza via useState
 * Isso permite que useSiteBranding use dados do banco em vez de apenas variáveis de ambiente
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  if (import.meta.server) {
    try {
      const settings = await $fetch<{ ok: true; settings: any }>('/api/site-settings')
      if (settings?.ok && settings?.settings) {
        console.log('[site-settings plugin] loaded:', settings.settings)
        // Disponibilizar via useState para uso em composables (SSR-safe)
        const siteSettingsState = useState('siteSettings', () => settings.settings)
        console.log('[site-settings plugin] state set:', siteSettingsState.value)
      }
    } catch (err) {
      console.error('[site-settings plugin] error:', err)
    }
  }
})
