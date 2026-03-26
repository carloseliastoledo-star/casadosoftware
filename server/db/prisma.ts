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

const prisma = hasDatabaseUrl
  ? new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
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