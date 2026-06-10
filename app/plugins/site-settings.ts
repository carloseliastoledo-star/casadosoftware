/**
 * site-settings plugin - Carrega dados do SiteSettings do banco e disponibiliza via provide
 * Isso permite que useSiteBranding use dados do banco em vez de apenas variáveis de ambiente
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  if (import.meta.server) {
    try {
      const settings = await $fetch<{ ok: true; settings: any }>('/api/site-settings')
      if (settings?.ok && settings?.settings) {
        // Disponibilizar via provide para uso em composables
        nuxtApp.provide('siteSettings', settings.settings)
      }
    } catch (err) {
      console.error('[site-settings plugin] error:', err)
    }
  }
})
