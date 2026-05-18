import { defineEventHandler, type H3Event } from 'h3'

export default defineEventHandler((event: H3Event) => {
  const path = event.node.req.url || ''
  if (path.startsWith('/produto/')) {
    console.log('[DEBUG-204] Incoming request:', path)
    let _statusCode = event.node.res.statusCode
    try {
      Object.defineProperty(event.node.res, 'statusCode', {
        get() { return _statusCode },
        set(val: number) {
          if (val === 204) {
            console.log('[DEBUG-204] statusCode=204 SET for:', path, new Error().stack?.split('\n').slice(1, 8).join(' | '))
          }
          _statusCode = val
        },
        configurable: true
      })
    } catch (e) {
      console.log('[DEBUG-204] defineProperty failed:', e)
    }
    const origEnd = event.node.res.end.bind(event.node.res)
    event.node.res.end = function (...args: any[]) {
      console.log('[DEBUG-204] Response statusCode:', _statusCode, 'for path:', path)
      return origEnd(...args)
    }
  }
})
