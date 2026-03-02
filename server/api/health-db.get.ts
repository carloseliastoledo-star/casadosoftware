import { defineEventHandler } from 'h3'
import prisma from '../db/prisma'

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('DB timeout')), ms)
    p.then((v) => {
      clearTimeout(t)
      resolve(v)
    }).catch((err) => {
      clearTimeout(t)
      reject(err)
    })
  })
}

export default defineEventHandler(async () => {
  const startedAt = Date.now()
  await withTimeout((prisma as any).$queryRaw`SELECT 1`, 2000)
  return {
    ok: true,
    ms: Date.now() - startedAt
  }
})
