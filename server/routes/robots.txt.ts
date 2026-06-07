import { defineEventHandler, setHeader, getRequestURL, getRequestHeader } from 'h3'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  const reqUrl = getRequestURL(event)
  const rawHost = String(
    getRequestHeader(event, 'x-forwarded-host') ||
    getRequestHeader(event, 'host') ||
    reqUrl.hostname || ''
  ).split(',')[0]?.trim().toLowerCase() || 'casadosoftware.com.br'

  const isGvgmall = rawHost.includes('gvgmall.co')

  // gvgmall.co always uses www canonical
  const origin = isGvgmall
    ? 'https://www.gvgmall.co'
    : `https://${rawHost}`

  if (isGvgmall) {
    return (
      'User-agent: *\n' +
      'Disallow: /admin\n' +
      'Disallow: /api\n' +
      'Disallow: /checkout\n' +
      'Disallow: /minha-conta\n' +
      'Allow: /\n' +
      '\n' +
      `Sitemap: ${origin}/sitemap.xml\n`
    )
  }

  return (
    'User-agent: *\n' +
    'Disallow: /admin\n' +
    'Disallow: /api\n' +
    'Disallow: /checkout\n' +
    'Disallow: /carrinho\n' +
    'Disallow: /minha-conta\n' +
    'Disallow: /affiliate\n' +
    'Disallow: /en\n' +
    'Disallow: /es\n' +
    'Disallow: /fr\n' +
    'Disallow: /it\n' +
    'Allow: /\n' +
    '\n' +
    `Sitemap: ${origin}/sitemap.xml\n`
  )
})
