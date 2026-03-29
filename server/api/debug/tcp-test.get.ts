import { defineEventHandler } from 'h3'
import { createConnection } from 'net'

export default defineEventHandler(async (_event) => {
  const host = 'centerbeam.proxy.rlwy.net'
  const port = 56368

  const result = await new Promise<{ ok: boolean; ms: number; error?: string }>((resolve) => {
    const start = Date.now()
    const conn = createConnection({ host, port })

    conn.setTimeout(5000)

    conn.on('connect', () => {
      conn.destroy()
      resolve({ ok: true, ms: Date.now() - start })
    })

    conn.on('error', (err: any) => {
      resolve({ ok: false, ms: Date.now() - start, error: err?.message || String(err) })
    })

    conn.on('timeout', () => {
      conn.destroy()
      resolve({ ok: false, ms: Date.now() - start, error: 'TCP timeout after 5s' })
    })
  })

  return {
    host,
    port,
    ...result
  }
})
