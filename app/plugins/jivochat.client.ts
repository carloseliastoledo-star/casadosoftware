export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const existingScript = document.querySelector('script[src*="code.jivosite.com/widget"]')
  if (existingScript) return

  const script = document.createElement('script')
  script.src = '//code.jivosite.com/widget/CwTN5r8XCk'
  script.async = true
  document.head.appendChild(script)
})
