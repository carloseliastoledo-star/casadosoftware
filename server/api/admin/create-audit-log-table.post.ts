import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async () => {
  try {
    // Criar tabela AuditLog manualmente via SQL raw
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS AuditLog (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        action VARCHAR(191) NOT NULL,
        entity VARCHAR(191) NOT NULL,
        entityId TEXT,
        adminId VARCHAR(191) NOT NULL,
        adminEmail VARCHAR(191) NOT NULL,
        details TEXT,
        ip VARCHAR(191),
        userAgent TEXT,
        storeSlug VARCHAR(191),
        createdAt DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_action (action),
        INDEX idx_entity (entity),
        INDEX idx_adminId (adminId),
        INDEX idx_createdAt (createdAt),
        INDEX idx_storeSlug (storeSlug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    return { ok: true, message: 'Tabela AuditLog criada com sucesso' }
  } catch (err: any) {
    console.error('[create-audit-log-table] Error:', err)
    return { ok: false, error: err?.message || 'Erro ao criar tabela' }
  }
})
