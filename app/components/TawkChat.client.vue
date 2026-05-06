<template>
  <!-- Client-only Tawk.to chat widget -->
</template>

<script setup>
// Tawk.to Live Chat - Only runs on client side after mount
onMounted(() => {
  if (!import.meta.client) return
  
  // Prevent duplicate loading
  if (window.Tawk_API && window.Tawk_LoadStart) return
  
  window.Tawk_API = window.Tawk_API || {}
  window.Tawk_LoadStart = new Date()
  
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://embed.tawk.to/69fb4d5d507e611c31480e5b/1jnuqcdm4'
  script.charset = 'UTF-8'
  script.setAttribute('crossorigin', '*')
  
  // Safe append to head
  if (document.head) {
    document.head.appendChild(script)
  }
})
</script>
