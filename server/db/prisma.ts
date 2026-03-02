import './ssl'
import { PrismaClient } from '@prisma/client'

const databaseUrl = process.env.DATABASE_URL ?? process.env.CONNECTION_STRING

if (!databaseUrl) {
  throw new Error('Missing database connection string: set DATABASE_URL (or CONNECTION_STRING) in the runtime environment.')
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log: ['error']
})

export default prisma
