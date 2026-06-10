const GTM_ID = 'GTM-TRF7PNLP'

const GTM_SCRIPT = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`

const GTM_NOSCRIPT = `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`

export default defineNuxtPlugin({
  name: 'gtm',
  enforce: 'pre',
  setup() {
    useHead({
      script: [
        {
          key: 'gtm-head',
          textContent: GTM_SCRIPT,
          tagPriority: 0
        }
      ],
      noscript: [
        {
          key: 'gtm-body',
          innerHTML: GTM_NOSCRIPT,
          tagPosition: 'bodyOpen'
        }
      ]
    })
  }
})
