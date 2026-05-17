import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const prismaBin = join(__dirname, '..', 'node_modules', '.bin', 'prisma')

console.log('[resolve-failed-migration] Starting resolution...')

try {
  const result = execSync(
    `"${prismaBin}" migrate resolve --rolled-back "20260518000000_fix_seo_page_store_slug"`,
    { encoding: 'utf-8', timeout: 30000, stdio: 'pipe' }
  )
  console.log('[resolve-failed-migration] CLI success:', result)
} catch (err) {
  console.error('[resolve-failed-migration] CLI failed, trying raw SQL fallback...')
  console.error('CLI stderr:', err?.stderr || err?.message)

  // Fallback: use PrismaClient raw SQL
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  try {
    await prisma.$executeRaw`
      UPDATE _prisma_migrations
      SET rolled_back_at = NOW(),
          logs = CONCAT(IFNULL(logs,''), '\\nResolved by build script')
      WHERE migration_name = '20260518000000_fix_seo_page_store_slug'
        AND finished_at IS NULL
        AND rolled_back_at IS NULL
    `
    console.log('[resolve-failed-migration] Raw SQL fallback applied')
  } catch (sqlErr) {
    console.error('[resolve-failed-migration] Raw SQL fallback failed:', sqlErr?.message || sqlErr)
  } finally {
    await prisma.$disconnect()
  }
}
