import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async (_event) => {
  const dbUrl = process.env.DATABASE_URL || ''
  const masked = dbUrl
    ? dbUrl.replace(/:([^:@]+)@/, ':***@').substring(0, 80)
    : '(not set)'

  try {
    const result = await (prisma as any).$queryRaw`SELECT 1 as ok`
    return {
      status: 'ok',
      db: masked,
      result
    }
  } catch (err: any) {
    return {
      status: 'error',
      db: masked,
      errorMessage: err?.message || String(err),
      errorCode: err?.code,
      errorMeta: err?.meta
    }
  }
})
