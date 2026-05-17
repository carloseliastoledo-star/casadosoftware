import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
  const rows = await prisma.$queryRaw`
    SELECT migration_name, finished_at, rolled_back_at, logs
    FROM _prisma_migrations
    WHERE migration_name = '20260518000000_fix_seo_page_store_slug'
  `

  if (!rows || rows.length === 0) {
    console.log('[resolve-failed-migration] Migration not found in _prisma_migrations, nothing to do')
    process.exit(0)
  }

  const row = rows[0]
  console.log('[resolve-failed-migration] Found migration:', {
    name: row.migration_name,
    finished_at: row.finished_at,
    rolled_back_at: row.rolled_back_at
  })

  if (!row.finished_at && !row.rolled_back_at) {
    await prisma.$executeRaw`
      UPDATE _prisma_migrations
      SET rolled_back_at = NOW(),
          logs = CONCAT(IFNULL(logs,''), '\\nResolved by build script')
      WHERE migration_name = '20260518000000_fix_seo_page_store_slug'
    `
    console.log('[resolve-failed-migration] Marked as rolled back via Prisma')
  } else {
    console.log('[resolve-failed-migration] Migration already resolved')
  }
} catch (err) {
  console.error('[resolve-failed-migration] Error:', err?.message || err)
  process.exit(0) // Don't fail the build
} finally {
  await prisma.$disconnect()
}
