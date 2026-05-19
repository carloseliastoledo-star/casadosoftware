import { defineEventHandler, setHeader, getRequestURL } from 'h3'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/manifest+json; charset=utf-8')

  const reqUrl = getRequestURL(event)
  const base = (String(process.env.SITE_URL || '').trim() || reqUrl.origin).replace(/\/$/, '')

  const host = String(reqUrl?.host || '').toLowerCase()
  const isCasaDoSoftware = host.includes('casadosoftware.com.br')

  const name = String(process.env.SITE_NAME || '').trim() || 'Site'
  const shortName = String(process.env.SITE_SHORT_NAME || '').trim() || name
  const themeColor = String(process.env.SITE_THEME_COLOR || '').trim() || '#2563eb'
  const backgroundColor = String(process.env.SITE_BACKGROUND_COLOR || '').trim() || '#ffffff'

  const envIcon = String(process.env.SITE_LOGO_PATH || '').trim()
  const iconPath = envIcon && envIcon !== '/logo.png'
    ? envIcon
    : (isCasaDoSoftware ? 'https://pub-388810139d004c3eb59d2d54c6e92aa7.r2.dev/uploads/Logo%20Marca%201.png' : '/logo-mercadosoftwares.png')

  return JSON.stringify(
    {
      name,
      short_name: shortName,
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: backgroundColor,
      theme_color: themeColor,
      icons: [
        {
          src: iconPath,
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      id: base ? `${base}/` : '/'
    },
    null,
    2
  )
})
