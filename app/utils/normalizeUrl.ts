/**
 * Normaliza URLs para uso em SEO e schemas JSON-LD
 * Evita duplicação de domínio quando a URL já é absoluta
 */
export function normalizeUrl(url: string | undefined, siteUrl: string): string {
  if (!url) return ''
  const trimmed = String(url).trim()
  if (!trimmed) return ''
  
  // Se já for URL absoluta (http:// ou https://), usar direto
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  
  // Se começar com /, concatenar com siteUrl
  if (trimmed.startsWith('/')) {
    return `${siteUrl}${trimmed}`
  }
  
  // Caso contrário, concatenar com /
  return `${siteUrl}/${trimmed}`
}
