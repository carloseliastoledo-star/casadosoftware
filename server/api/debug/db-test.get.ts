import { defineEventHandler } from 'h3'

export default defineEventHandler(async (_event) => {
  const dbUrl = process.env.DATABASE_URL || ''
  const masked = dbUrl
    ? dbUrl.replace(/:([^:@]+)@/, ':***@').substring(0, 80)
    : '(not set)'

  let prisma: any
  try {
    const mod = await import('../../db/prisma')
    prisma = mod.default
  } catch (importErr: any) {
    return {
      status: 'prisma-import-error',
      db: masked,
      errorMessage: importErr?.message || String(importErr),
      errorCode: importErr?.code
    }
  }

  try {
    const rows = await prisma.$queryRaw`SELECT 1 as ok`
    return {
      status: 'ok',
      db: masked,
      result: JSON.parse(JSON.stringify(rows, (_k: string, v: any) => (typeof v === 'bigint' ? v.toString() : v)))
    }
  } catch (err: any) {
    return {
      status: 'query-error',
      db: masked,
      errorMessage: err?.message || String(err),
      errorCode: err?.code,
      errorMeta: err?.meta
    }
  }
})
