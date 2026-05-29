import { defineEventHandler, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const prismaAny = prisma as any

  // Fix NULL storeSlug in Produto
  await prismaAny.$executeRawUnsafe(`UPDATE Produto SET storeSlug = 'casadosoftware' WHERE storeSlug IS NULL`)

  // Add storeSlug column to Affiliate if not exists
  try {
    await prismaAny.$executeRawUnsafe(`ALTER TABLE Affiliate ADD COLUMN storeSlug VARCHAR(100) NOT NULL DEFAULT 'casadosoftware'`)
  } catch (err: any) {
    if (!err.message?.includes('Duplicate column')) {
      console.error('[fix affiliate] Error adding storeSlug column:', err)
    }
  }

  // Drop old unique constraint on email
  try {
    await prismaAny.$executeRawUnsafe(`ALTER TABLE Affiliate DROP INDEX Affiliate_email_key`)
  } catch (err: any) {
    if (!err.message?.includes('Can\'t DROP') && !err.message?.includes('1091')) {
      console.error('[fix affiliate] Error dropping index:', err)
    }
  }

  // Add new unique constraint on (storeSlug, email)
  try {
    await prismaAny.$executeRawUnsafe(`ALTER TABLE Affiliate ADD UNIQUE INDEX Affiliate_storeSlug_email_key(storeSlug, email)`)
  } catch (err: any) {
    if (!err.message?.includes('Duplicate') && !err.message?.includes('1061')) {
      console.error('[fix affiliate] Error adding unique index:', err)
    }
  }

  return { ok: true, message: 'Affiliate storeSlug fix applied' }
})
