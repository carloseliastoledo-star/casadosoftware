export const useMarketing = () => {
  function trackMeta(eventName: string, payload?: Record<string, unknown>) {
    if (!import.meta.client) return
    try {
      const w = window as any
      if (typeof w.fbq === 'function') {
        w.fbq('track', eventName, { currency: 'BRL', ...(payload ?? {}) })
      }
    } catch {}
  }

  function trackGtag(eventName: string, payload?: Record<string, unknown>) {
    if (!import.meta.client) return
    try {
      const w = window as any
      if (typeof w.gtag === 'function') {
        w.gtag('event', eventName, payload ?? {})
      }
    } catch {}
  }

  return { trackMeta, trackGtag }
}
