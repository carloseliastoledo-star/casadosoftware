// Tawk.to Live Chat Plugin - Client-side only
export default defineNuxtPlugin(() => {
  if (!process.client) return

  console.log('[Tawk] Starting inline embed...')

  // Inline embed script exactly as Tawk.to provides
  const inlineScript = `
    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
    (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/69fb4d5d507e611c31480e5b/1jnuqcdm4';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
    })();
  `

  // Create script element with inline code
  const script = document.createElement('script')
  script.textContent = inlineScript
  
  // Add to head
  if (document.head) {
    document.head.appendChild(script)
    console.log('[Tawk] Inline script added to head')
  }

  // Check after 3 seconds
  setTimeout(() => {
    const tawkFrame = document.querySelector('iframe[src*="tawk.to"]')
    console.log('[Tawk] Widget iframe found:', !!tawkFrame)
    
    // Try to show widget if hidden
    if (tawkFrame) {
      ;(tawkFrame as HTMLElement).style.display = 'block'
      ;(tawkFrame as HTMLElement).style.visibility = 'visible'
      ;(tawkFrame as HTMLElement).style.opacity = '1'
      console.log('[Tawk] Widget styles applied')
    }
  }, 3000)
})
