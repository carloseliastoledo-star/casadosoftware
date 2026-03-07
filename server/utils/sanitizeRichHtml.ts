import DOMPurify from 'isomorphic-dompurify'

type HookNode = HTMLElement & { getAttribute(name: string): string | null }

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

export function sanitizeRichHtml(input: unknown, options: SanitizeOptions = {}) {
  const allowIframes = options.allowIframes !== false

  const purify = DOMPurify as any

  purify.removeAllHooks?.()
  purify.addHook?.('afterSanitizeAttributes', (node: HookNode) => {
    if (node?.tagName?.toLowerCase?.() === 'a') {
      const href = String(node.getAttribute('href') || '').trim()
      if (/^https?:\/\//i.test(href)) {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
      }
    }

    if (allowIframes && node?.tagName?.toLowerCase?.() === 'iframe') {
      const src = String(node.getAttribute('src') || '').trim()
      if (!isAllowedIframeSrc(src)) {
        node.removeAttribute('src')
      }

      const allow = String(node.getAttribute('allow') || '').trim()
      if (!allow) {
        node.setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        )
      }

      if (!node.getAttribute('referrerpolicy')) {
        node.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
      }

      node.setAttribute('loading', 'lazy')
    }
  })

  return DOMPurify.sanitize(String(input ?? ''), {
    USE_PROFILES: { html: true },
    ADD_TAGS: allowIframes ? ['iframe', 'video', 'source'] : ['video', 'source'],
    ADD_ATTR: [
      'class',
      'target',
      'rel',
      'loading',
      'allow',
      'allowfullscreen',
      'frameborder',
      'referrerpolicy',
      'src',
      'srcset',
      'sizes',
      'alt',
      'title',
      'width',
      'height',
      'controls',
      'poster',
      'playsinline',
      'autoplay',
      'muted',
      'loop',
      'type'
    ],
    FORBID_ATTR: ['style', 'id', 'onerror', 'onclick', 'onload']
  })
}
