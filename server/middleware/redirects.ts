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

  // Redirect 301: slugs antigos de produtos para novos slugs
  const productRedirects: Record<string, string> = {
    '/produto/office-365-original': '/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive',
    '/produto/windows-11-pro': '/produto/microsoft-windows-11-pro-chave-esd-32-64-bits'
  }

  if (productRedirects[path]) {
    setResponseStatus(event, 301)
    setResponseHeaders(event, {
      'Location': productRedirects[path],
      'Cache-Control': 'public, max-age=31536000, immutable'
    })
    return 'Moved Permanently'
  }

  // Redirect 301: categorias vazias, genéricas ou duplicadas
  const categoryRedirects: Record<string, string> = {
    '/categoria/games': '/categoria/jogos',
    '/categoria/electronics': '/',
    '/categoria/adobe': '/categoria/autodesk'
  }

  if (categoryRedirects[path]) {
    setResponseStatus(event, 301)
    setResponseHeaders(event, {
      'Location': categoryRedirects[path],
      'Cache-Control': 'public, max-age=31536000, immutable'
    })
    return 'Moved Permanently'
  }
})
