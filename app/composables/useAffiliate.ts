/**
 * Captura e persiste código de afiliado via URL ?ref=CODE
 * Salva em localStorage + cookie para sobreviver a redirects
 */
export const useAffiliate = () => {
  const COOKIE_NAME = 'ref'
  const STORAGE_KEY = 'affiliate_ref'
  const TTL_DAYS = 30

  function saveRef(code: string) {
    if (!code) return
    const expires = new Date(Date.now() + TTL_DAYS * 86400 * 1000).toUTCString()
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(code)}; path=/; expires=${expires}; SameSite=Lax`
    try { localStorage.setItem(STORAGE_KEY, code) } catch {}
    console.log('[affiliate] code saved:', code)
  }

  function getRef(): string {
    // 1. URL param tem prioridade
    if (import.meta.client) {
      const url = new URL(window.location.href)
      const param = url.searchParams.get('ref') || url.searchParams.get('affiliate')
      if (param) {
        console.log('[affiliate] code detected in URL:', param)
        saveRef(param)
        return param
      }
    }

    // 2. Cookie
    if (import.meta.client) {
      const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
      if (match) {
        const code = decodeURIComponent(match[1])
        console.log('[affiliate] code loaded from cookie:', code)
        return code
      }
    }

    // 3. localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        console.log('[affiliate] code loaded from localStorage:', stored)
        return stored
      }
    } catch {}

    console.log('[affiliate] no affiliate code found')
    return ''
  }

  function clearRef() {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  return { saveRef, getRef, clearRef }
}
