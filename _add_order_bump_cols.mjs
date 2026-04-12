import { createConnection } from 'mysql2/promise'

const db = await createConnection(process.env.DATABASE_URL)

const cols = [
  ["orderBumpTitle",       "ALTER TABLE SiteSettings ADD COLUMN orderBumpTitle       VARCHAR(255) NULL"],
  ["orderBumpDescription", "ALTER TABLE SiteSettings ADD COLUMN orderBumpDescription TEXT         NULL"],
  ["orderBumpPrice",       "ALTER TABLE SiteSettings ADD COLUMN orderBumpPrice        DOUBLE       NULL DEFAULT 19"],
]

for (const [col, sql] of cols) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'SiteSettings' AND COLUMN_NAME = ?`,
    [col]
  )
  if (rows[0].cnt > 0) {
    console.log(`[skip] ${col} já existe`)
  } else {
    await db.query(sql)
    console.log(`[ok]   ${col} adicionado`)
  }
}

await db.end()
console.log('Migração concluída.')
