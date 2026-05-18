import { defineEventHandler, type H3Event } from 'h3'

export default defineEventHandler((event: H3Event) => {
  const path = event.node.req.url || ''
  if (path.startsWith('/produto/')) {
    console.log('[DEBUG-204] Incoming request:', path, 'host:', event.node.req.headers['x-forwarded-host'] || event.node.req.headers.host)
    const origWriteHead = event.node.res.writeHead.bind(event.node.res)
    ;(event.node.res as any).writeHead = function (code: number, ...rest: any[]) {
      if (code === 204) {
        console.log('[DEBUG-204] writeHead(204) called for path:', path, new Error().stack?.split('\n').slice(1, 6).join(' | '))
      }
      return origWriteHead(code, ...rest)
    }
    const origEnd = event.node.res.end.bind(event.node.res)
    event.node.res.end = function (...args: any[]) {
      const sc = event.node.res.statusCode
      console.log('[DEBUG-204] Response statusCode:', sc, 'for path:', path)
      return origEnd(...args)
    }
  }
})
