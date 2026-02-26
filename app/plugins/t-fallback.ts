export default defineNuxtPlugin((nuxtApp) => {
  const vueApp = nuxtApp.vueApp
  const gp: any = vueApp?.config?.globalProperties

  if (!gp) return

  if (typeof gp.$t !== 'function') {
    gp.$t = (key: any) => {
      if (key === null || key === undefined) return ''
      return String(key)
    }
  }
})
