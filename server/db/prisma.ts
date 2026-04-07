import './ssl'
import { PrismaClient } from '@prisma/client'

const hasDatabaseUrl =
  typeof process.env.DATABASE_URL === 'string' &&
  process.env.DATABASE_URL.trim().length > 0

function createPrismaMock() {
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === '$connect') return async () => {}
      if (prop === '$disconnect') return async () => {}
      if (prop === '$transaction') {
        return async (arg: any) => {
          if (typeof arg === 'function') return arg(createPrismaMock())
          return Array.isArray(arg) ? [] : null
        }
      }

      return new Proxy(
        {},
        {
          get(_modelTarget, method) {
            const emptyArrayMethods = new Set([
              'findMany',
              'createMany',
              'updateMany',
              'deleteMany',
              'aggregate',
              'groupBy'
            ])

            const nullMethods = new Set([
              'findFirst',
              'findUnique',
              'create',
              'update',
              'upsert',
              'delete',
              'count'
            ])

            if (emptyArrayMethods.has(String(method))) {
              return async () => []
            }

            if (nullMethods.has(String(method))) {
              return async () => null
            }

            return async () => null
          }
        }
      )
    }
  }

  return new Proxy({}, handler)
}

function buildDatabaseUrl(raw: string): string {
  try {
    const url = new URL(raw)
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '1')
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', '20')
    }
    return url.toString()
  } catch {
    const sep = raw.includes('?') ? '&' : '?'
    if (!raw.includes('connection_limit')) {
      return `${raw}${sep}connection_limit=1&pool_timeout=20`
    }
    return raw
  }
}

const prisma = hasDatabaseUrl
  ? new PrismaClient({
      datasources: {
        db: {
          url: buildDatabaseUrl(process.env.DATABASE_URL as string)
        }
      },
      log: ['error']
    })
  : createPrismaMock()

if (!hasDatabaseUrl) {
  console.warn(
    '[prisma] DATABASE_URL ausente. Rodando em modo bypass local com mock.'
  )
}

export default prisma as any