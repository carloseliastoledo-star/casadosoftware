import { defineNitroPlugin } from 'nitropack/runtime'

const GTM_HEAD = `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TRF7PNLP');<\/script>`

const GTM_BODY = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TRF7PNLP" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`

export default defineNitroPlugin((nitroApp: any) => {
  nitroApp.hooks.hook('render:html', (html: any) => {
    if (!html.head.some((s: string) => s.includes('GTM-TRF7PNLP'))) {
      html.head.unshift(GTM_HEAD)
    }
    if (!html.bodyPrepend.some((s: string) => s.includes('GTM-TRF7PNLP'))) {
      html.bodyPrepend.unshift(GTM_BODY)
    }
  })
})
