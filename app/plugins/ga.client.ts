// Plugin desativado - tracking agora é gerenciado pelo TrackingHead.vue e useTracking.ts
// Este arquivo foi substituído pelo novo sistema de tracking dinâmico e centralizado
// Se precisar reativar, renomeie para ga.client.ts e remova o prefixo .disabled

export default defineNuxtPlugin(() => {
  // Plugin desativado para evitar duplicação de scripts gtag.js
  // O novo sistema carrega gtag.js dinamicamente via TrackingHead.vue
})
