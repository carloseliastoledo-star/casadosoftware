/**
 * site-settings plugin - Carrega dados do SiteSettings do banco para runtimeConfig
 * Isso permite que useSiteBranding use dados do banco em vez de apenas variáveis de ambiente
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  if (import.meta.server) {
    try {
      const settings = await $fetch<{ ok: true; settings: any }>('/api/site-settings')
      if (settings?.ok && settings?.settings) {
        const config = useRuntimeConfig()
        // Atualizar runtimeConfig.public com dados do banco
        if (settings.settings.siteName) (config.public as any).siteName = settings.settings.siteName
        if (settings.settings.supportEmail) (config.public as any).supportEmail = settings.settings.supportEmail
        if (settings.settings.whatsappNumber) (config.public as any).whatsappNumber = settings.settings.whatsappNumber
        if (settings.settings.companyLegalName) (config.public as any).companyLegalName = settings.settings.companyLegalName
        if (settings.settings.companyCnpj) (config.public as any).companyCnpj = settings.settings.companyCnpj
        if (settings.settings.companyAddress) (config.public as any).companyAddress = settings.settings.companyAddress
        if (settings.settings.companyPhone) (config.public as any).companyPhone = settings.settings.companyPhone
        if (settings.settings.companyEmail) (config.public as any).companyEmail = settings.settings.companyEmail
      }
    } catch (err) {
      console.error('[site-settings plugin] error:', err)
    }
  }
})
