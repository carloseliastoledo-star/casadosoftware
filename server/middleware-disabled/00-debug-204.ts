import { defineEventHandler, type H3Event } from 'h3'

export default defineEventHandler((event: H3Event) => {
  const path = event.node.req.url || ''
  if (path.startsWith('/produto/')) {
    console.log('[DEBUG-204] Incoming request:', path, 'host:', event.node.req.headers['x-forwarded-host'] || event.node.req.headers.host)
    const origEnd = event.node.res.end.bind(event.node.res)
    event.node.res.end = function (...args: any[]) {
      console.log('[DEBUG-204] Response statusCode:', event.node.res.statusCode, 'for path:', path)
      return origEnd(...args)
    }
  }
})
