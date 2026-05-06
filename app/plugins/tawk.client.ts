// Tawk.to Live Chat Plugin - Client-side only
export default defineNuxtPlugin(() => {
  // Only run on client
  if (!process.client) return

  console.log('[Tawk] Plugin loaded')

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTawk)
  } else {
    initTawk()
  }

  function initTawk() {
    console.log('[Tawk] Initializing...')

    // Check if already loaded
    if ((window as any).Tawk_API?.loaded) {
      console.log('[Tawk] Already loaded')
      return
    }

    // Initialize Tawk_API
    ;(window as any).Tawk_API = (window as any).Tawk_API || {}
    ;(window as any).Tawk_LoadStart = new Date()

    // Create and append script
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://embed.tawk.to/69fb4d5d507e611c31480e5b/1jnuqcdm4'
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')

    script.onload = () => {
      console.log('[Tawk] Script loaded successfully')
    }

    script.onerror = () => {
      console.error('[Tawk] Failed to load script')
    }

    // Append to body
    document.body.appendChild(script)
    console.log('[Tawk] Script appended to body')
  }
})
