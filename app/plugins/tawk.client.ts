// Tawk.to Live Chat Plugin - Client-side only
export default defineNuxtPlugin(() => {
  // Only run on client
  if (!process.client) return

  // Initialize Tawk_API
  ;(window as any).Tawk_API = (window as any).Tawk_API || {}
  ;(window as any).Tawk_LoadStart = new Date()

  // Create and append script
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://embed.tawk.to/69fb4d5d507e611c31480e5b/1jnuqcdm4'
  script.charset = 'UTF-8'
  script.setAttribute('crossorigin', '*')

  // Append to body
  document.body.appendChild(script)
})
