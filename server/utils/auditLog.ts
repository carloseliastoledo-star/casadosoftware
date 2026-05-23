import prisma from '../db/prisma'
import { randomUUID } from 'crypto'

export interface AuditLogOptions {
  action: string
  entity: string
  entityId?: string
  adminId: string
  adminEmail: string
  details?: string
  ip?: string
  userAgent?: string
  storeSlug?: string
}

export async function createAuditLog(opts: AuditLogOptions) {
  try {
    // Usar SQL raw para evitar problemas com Prisma Client que não tem o modelo AuditLog
    await prisma.$queryRawUnsafe(`
      INSERT INTO AuditLog (id, action, entity, entityId, adminId, adminEmail, details, ip, userAgent, storeSlug, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      randomUUID(),
      opts.action,
      opts.entity,
      opts.entityId || null,
      opts.adminId,
      opts.adminEmail,
      opts.details || null,
      opts.ip || null,
      opts.userAgent || null,
      opts.storeSlug || null
    )
    console.log('[auditLog] Created audit log', { action: opts.action, entity: opts.entity, adminEmail: opts.adminEmail })
  } catch (err) {
    console.error('[auditLog] Failed to create audit log', err)
  }
}
