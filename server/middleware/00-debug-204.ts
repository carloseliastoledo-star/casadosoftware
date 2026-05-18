import { defineEventHandler, setResponseHeader, type H3Event } from 'h3'

export default defineEventHandler((event: H3Event) => {
  const path = event.node.req.url || ''
  if (path.startsWith('/produto/')) {
    const reqHeaders = event.node.req.headers
    console.log('[DEBUG-204] Incoming request:', path, JSON.stringify({
      host: reqHeaders['x-forwarded-host'] || reqHeaders['host'],
      xVercelId: reqHeaders['x-vercel-id'],
      xVercelCache: reqHeaders['x-vercel-cache'],
      xRealIp: reqHeaders['x-real-ip'],
      purpose: reqHeaders['purpose'] || reqHeaders['sec-purpose'],
    }))
    const origEnd = event.node.res.end.bind(event.node.res)
    event.node.res.end = function (...args: any[]) {
      const sc = event.node.res.statusCode
      console.log('[DEBUG-204] Response statusCode:', sc, 'for path:', path)
      return origEnd(...args)
    }
  }
})
