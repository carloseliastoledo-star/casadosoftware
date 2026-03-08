export function decodeHtmlEntities(input: unknown): string {
  const s = String(input ?? '')
  if (!s) return ''

  const looksEscapedHtml =
    s.includes('&lt;') ||
    s.includes('&gt;') ||
    s.includes('&#60;') ||
    s.includes('&#62;') ||
    /&#x0*3c;/i.test(s) ||
    /&#x0*3e;/i.test(s)

  if (!looksEscapedHtml) return s

  let out = s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')

  out = out.replace(/&#(\d+);/g, (_m, num) => {
    const n = Number(num)
    if (!Number.isFinite(n)) return _m
    try {
      return String.fromCodePoint(n)
    } catch {
      return _m
    }
  })

  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => {
    const n = Number.parseInt(String(hex), 16)
    if (!Number.isFinite(n)) return _m
    try {
      return String.fromCodePoint(n)
    } catch {
      return _m
    }
  })

  return out
}
