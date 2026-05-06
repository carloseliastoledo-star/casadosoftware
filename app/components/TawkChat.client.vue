<template>
  <!-- Client-only Tawk.to chat widget -->
</template>

<script setup>
// Tawk.to Live Chat - Only runs on client side
if (import.meta.client) {
  window.Tawk_API = window.Tawk_API || {}
  window.Tawk_LoadStart = new Date()
  
  ;(function () {
    const s1 = document.createElement('script')
    const s0 = document.getElementsByTagName('script')[0]
    s1.async = true
    s1.src = 'https://embed.tawk.to/69fb4d5d507e611c31480e5b/1jnuqcdm4'
    s1.charset = 'UTF-8'
    s1.setAttribute('crossorigin', '*')
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0)
    } else {
      document.head.appendChild(s1)
    }
  })()
}
</script>
