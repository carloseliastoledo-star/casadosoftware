let _iconv: any = null
try {
  _iconv = require('iconv-lite')
} catch {}

const CP850_RE = /[\u2500-\u259F\u25A0-\u25FF\u251C\u2524\u252C\u2534\u253C]/

export function fixCp850(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return (value as string | null) ?? null
  if (!_iconv || !CP850_RE.test(value)) return value
  try {
    return (_iconv.encode(value, 'cp850') as Buffer).toString('utf8')
  } catch {
    return value
  }
}
