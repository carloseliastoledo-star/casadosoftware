import { defineEventHandler, type H3Event } from 'h3'

export default defineEventHandler((event: H3Event) => {
  const path = event.node.req.url || ''
  const origEnd = event.node.res.end.bind(event.node.res)
  event.node.res.end = function (...args: any[]) {
    const sc = event.node.res.statusCode
    if (sc === 204) {
      console.log('[DEBUG-204] 204 on path:', path, 'x-forwarded-for:', event.node.req.headers['x-forwarded-host'], 'purpose:', event.node.req.headers['purpose'] || event.node.req.headers['sec-purpose'] || 'none')
    }
    return origEnd(...args)
  }
})
