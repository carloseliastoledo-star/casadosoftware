import prisma from '../db/prisma'

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
    await prisma.auditLog.create({
      data: {
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId,
        adminId: opts.adminId,
        adminEmail: opts.adminEmail,
        details: opts.details,
        ip: opts.ip,
        userAgent: opts.userAgent,
        storeSlug: opts.storeSlug
      }
    })
    console.log('[auditLog] Created audit log', { action: opts.action, entity: opts.entity, adminEmail: opts.adminEmail })
  } catch (err) {
    console.error('[auditLog] Failed to create audit log', err)
  }
}
