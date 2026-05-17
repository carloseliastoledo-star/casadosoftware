import mysql from 'mysql2/promise'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.log('[resolve-failed-migration] DATABASE_URL not set, skipping')
  process.exit(0)
}

const connection = await mysql.createConnection(DATABASE_URL)

try {
  // Check if the failed migration exists
  const [rows] = await connection.execute(
    `SELECT migration_name, finished_at, rolled_back_at, logs
     FROM _prisma_migrations
     WHERE migration_name = ?`,
    ['20260518000000_fix_seo_page_store_slug']
  )

  if (rows.length === 0) {
    console.log('[resolve-failed-migration] Migration not found in _prisma_migrations, nothing to do')
    process.exit(0)
  }

  const row = rows[0]
  console.log('[resolve-failed-migration] Found migration:', {
    name: row.migration_name,
    finished_at: row.finished_at,
    rolled_back_at: row.rolled_back_at
  })

  // If it failed (finished_at is NULL and rolled_back_at is NULL), mark as rolled back
  if (!row.finished_at && !row.rolled_back_at) {
    await connection.execute(
      `UPDATE _prisma_migrations
       SET rolled_back_at = NOW(),
           logs = CONCAT(IFNULL(logs,''), '\\nManually resolved by build script')
       WHERE migration_name = ?`,
      ['20260518000000_fix_seo_page_store_slug']
    )
    console.log('[resolve-failed-migration] Marked as rolled back')
  } else {
    console.log('[resolve-failed-migration] Migration already resolved')
  }
} catch (err) {
  console.error('[resolve-failed-migration] Error:', err.message)
  process.exit(0) // Don't fail the build
} finally {
  await connection.end()
}
