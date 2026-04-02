import mysql from 'mysql2/promise'

// DigitalOcean (source – correct data)
const doConn = await mysql.createConnection({
  host: 'casadosoftware-db-do-user-32216731-0.e.db.ondigitalocean.com',
  port: 25060,
  user: 'doadmin',
  password: process.env.DO_PASSWORD || '',
  database: 'defaultdb',
  ssl: { rejectUnauthorized: false },
  charset: 'utf8mb4',
  connectTimeout: 15000,
})

// Railway (destination)
const rlUrl = new URL(process.env.DATABASE_URL)
const rlConn = await mysql.createConnection({
  host: rlUrl.hostname,
  port: parseInt(rlUrl.port),
  user: rlUrl.username,
  password: decodeURIComponent(rlUrl.password),
  database: rlUrl.pathname.slice(1),
  charset: 'utf8mb4',
})

const FIELDS = [
  'descricao', 'descricaoEn', 'descricaoEs', 'descricaoIt', 'descricaoFr',
  'cardItems',
  'tutorialTitulo', 'tutorialTituloEn', 'tutorialTituloEs', 'tutorialTituloIt', 'tutorialTituloFr',
  'tutorialSubtitulo', 'tutorialSubtituloEn', 'tutorialSubtituloEs', 'tutorialSubtituloIt', 'tutorialSubtituloFr',
  'tutorialConteudo', 'tutorialConteudoEn', 'tutorialConteudoEs', 'tutorialConteudoIt', 'tutorialConteudoFr',
]

console.log('Reading source (DigitalOcean)...')
const [doRows] = await doConn.query(`SELECT slug, ${FIELDS.join(', ')} FROM Produto`)
console.log(`  Found ${doRows.length} products in DO\n`)

console.log('Reading destination (Railway)...')
const [rlRows] = await rlConn.query('SELECT id, slug FROM Produto')
const rlMap = new Map(rlRows.map(r => [r.slug, r.id]))
console.log(`  Found ${rlRows.length} products in Railway\n`)

let updated = 0, skipped = 0, notFound = 0

for (const doRow of doRows) {
  const rlId = rlMap.get(doRow.slug)
  if (!rlId) {
    console.log(`  [SKIP] slug "${doRow.slug}" not found in Railway`)
    notFound++
    continue
  }

  // Build SET clause only for non-null fields
  const sets = []
  const vals = []
  for (const f of FIELDS) {
    if (doRow[f] !== null && doRow[f] !== undefined) {
      sets.push(`${f} = ?`)
      vals.push(doRow[f])
    }
  }

  if (!sets.length) {
    skipped++
    continue
  }

  vals.push(rlId)
  await rlConn.execute(`UPDATE Produto SET ${sets.join(', ')} WHERE id = ?`, vals)
  console.log(`  [OK] "${doRow.slug}" – updated ${sets.length} fields`)
  updated++
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped (no data), ${notFound} not found in Railway.`)

await doConn.end()
await rlConn.end()
