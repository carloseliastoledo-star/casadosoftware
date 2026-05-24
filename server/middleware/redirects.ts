import { defineEventHandler, getRequestURL, setResponseStatus, setResponseHeaders, H3Event } from 'h3'

export default defineEventHandler((event: H3Event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Redirect 301: URL antiga de tutorial para nova
  if (path === '/tutoriais/microsoft-office-365-pcs-mac-ios-e-android-microsoft-windows-10-pro-1-licenca') {
    setResponseStatus(event, 301)
    setResponseHeaders(event, {
      'Location': '/tutoriais/office-365',
      'Cache-Control': 'public, max-age=31536000, immutable'
    })
    return 'Moved Permanently'
  }

  // Redirect 301: /products para /produtos
  if (path === '/products') {
    setResponseStatus(event, 301)
    setResponseHeaders(event, {
      'Location': '/produtos',
      'Cache-Control': 'public, max-age=31536000, immutable'
    })
    return 'Moved Permanently'
  }
})
