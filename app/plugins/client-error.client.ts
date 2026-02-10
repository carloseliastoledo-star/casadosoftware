export default defineNuxtPlugin((nuxtApp) => {
  const send = (payload: any) => {
    const body = {
      ...payload,
      href: window.location.href,
      userAgent: navigator.userAgent
    }

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(body)], { type: 'application/json' })
        navigator.sendBeacon('/api/client-error', blob)
        return
      }
    } catch {
      // ignore
    }

    try {
      $fetch('/api/client-error', {
        method: 'POST',
        body
      }).catch(() => undefined)
    } catch {
      // ignore
    }
  }

  window.addEventListener('error', (event: any) => {
    try {
      send({
        type: 'error',
        message: String(event?.message || ''),
        filename: String(event?.filename || ''),
        lineno: Number(event?.lineno || 0),
        colno: Number(event?.colno || 0),
        stack: String(event?.error?.stack || '')
      })
    } catch {
      // ignore
    }
  })

  window.addEventListener('unhandledrejection', (event: any) => {
    try {
      const reason = event?.reason
      send({
        type: 'unhandledrejection',
        message: String(reason?.message || reason || ''),
        stack: String(reason?.stack || '')
      })
    } catch {
      // ignore
    }
  })

  nuxtApp.hook('app:error', (err: any) => {
    try {
      send({
        type: 'nuxt:app:error',
        message: String(err?.message || err || ''),
        stack: String(err?.stack || '')
      })
    } catch {
      // ignore
    }
  })

  try {
    const vueApp = (nuxtApp as any)?.vueApp
    if (vueApp?.config) {
      const prev = vueApp.config.errorHandler
      vueApp.config.errorHandler = (err: any, instance: any, info: any) => {
        try {
          send({
            type: 'vue:errorHandler',
            message: String(err?.message || err || ''),
            info: String(info || ''),
            stack: String(err?.stack || '')
          })
        } catch {
          // ignore
        }

        if (typeof prev === 'function') return prev(err, instance, info)
      }
    }
  } catch {
    // ignore
  }
})
