type SanitizeOptions = {
  allowIframes?: boolean
}

function isAllowedIframeSrc(src: string): boolean {
  const s = String(src || '').trim()
  if (!/^https?:\/\//i.test(s)) return false
  try {
    const url = new URL(s)
    const host = url.hostname.toLowerCase()
    if (host === 'www.youtube.com' || host === 'youtube.com' || host === 'www.youtube-nocookie.com' || host === 'youtube-nocookie.com') {
      return url.pathname.startsWith('/embed/')
    }
    if (host === 'player.vimeo.com') {
      return url.pathname.startsWith('/video/')
    }
    return false
  } catch {
    return false
  }
}

function hardenLinks(html: string): string {
  return html.replace(/<a\b([^>]*)>/gi, (match, attrs: string) => {
    const href = (attrs.match(/href\s*=\s*["']([^"']*)["']/i) || [])[1] || ''
    if (/^https?:\/\//i.test(href)) {
      let out = attrs
      if (!/\btarget\s*=/i.test(out)) out += ' target="_blank"'
      if (!/\brel\s*=/i.test(out)) out += ' rel="noopener noreferrer"'
      return `<a${out}>`
    }
    return match
  })
}

function hardenIframes(html: string): string {
  return html.replace(/<iframe\b([^>]*)>/gi, (match, attrs: string) => {
    const src = (attrs.match(/src\s*=\s*["']([^"']*)["']/i) || [])[1] || ''
    if (!isAllowedIframeSrc(src)) return ''
    let out = attrs
    if (!/\bloading\s*=/i.test(out)) out += ' loading="lazy"'
    if (!/\breferrerpolicy\s*=/i.test(out)) out += ' referrerpolicy="strict-origin-when-cross-origin"'
    if (!/\ballow\s*=/i.test(out)) out += ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"'
    return `<iframe${out}>`
  })
}

export function sanitizeRichHtml(input: unknown, options: SanitizeOptions = {}) {
  const allowIframes = options.allowIframes !== false
  let html = String(input ?? '')
  html = hardenLinks(html)
  if (allowIframes) {
    html = hardenIframes(html)
  } else {
    html = html.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
  }
  return html
}
