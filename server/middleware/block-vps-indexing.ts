/**
 * Middleware para bloquear indexação de vps.casadosoftware.com.br
 * Adiciona X-Robots-Tag: noindex, nofollow para este subdomínio
 */
export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host') || getRequestHeader(event, 'x-forwarded-host') || ''
  
  if (String(host).toLowerCase().includes('vps.casadosoftware.com.br')) {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }
})
