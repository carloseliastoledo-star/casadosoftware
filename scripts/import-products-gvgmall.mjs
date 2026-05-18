/**
 * Import products from CSV into gvgmall.co database.
 * Uses csv-parse to correctly handle multiline HTML inside quoted fields.
 * Usage:
 *   DATABASE_URL=<gvgmall_url> CSV_FILE=<path_to_csv> node scripts/import-products-gvgmall.mjs
 */
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { createReadStream } from 'fs'
import { parse } from 'csv-parse'

const STORE_SLUG = 'international'
const CSV_FILE = process.env.CSV_FILE || 'c:\\Users\\carlos\\Downloads\\products_import_fixed.csv'

const prisma = new PrismaClient()

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = []
    const parser = parse({ columns: true, skip_empty_lines: true, relax_quotes: true, trim: true })
    parser.on('readable', () => {
      let row
      while ((row = parser.read()) !== null) rows.push(row)
    })
    parser.on('error', reject)
    parser.on('end', () => resolve(rows))
    createReadStream(filePath).pipe(parser)
  })
}

async function main() {
  console.log('📂 Reading CSV:', CSV_FILE)
  const rows = await readCSV(CSV_FILE)
  console.log(`📦 ${rows.length} products found\n`)

  let created = 0
  let skipped = 0
  let errors = 0

  for (const row of rows) {
    const slug = (row.slug || slugify(row.name || '')).trim()
    if (!slug || !row.name) { console.warn('⚠️  Skipping row without name/slug'); skipped++; continue }

    const price = parseFloat(row.price)
    if (isNaN(price)) { console.warn('⚠️  Skipping', slug, '- invalid price:', row.price); skipped++; continue }

    try {
      const existing = await prisma.produto.findFirst({ where: { slug, storeSlug: STORE_SLUG } })
      if (existing) {
        console.log('⏭️  Already exists:', slug)
        skipped++
        continue
      }

      await prisma.produto.create({
        data: {
          id: randomUUID(),
          nome: row.name,
          slug,
          descricao: row.description || '',
          preco: price,
          imagem: row.image || null,
          ativo: true,
          storeSlug: STORE_SLUG,
        }
      })
      console.log('✅ Created:', slug)
      created++
    } catch (e) {
      console.error('❌ Error on', slug, ':', e.message)
      errors++
    }
  }

  console.log(`\n✅ Done: ${created} created, ${skipped} skipped, ${errors} errors.`)
}

main()
  .catch(e => { console.error('❌ Fatal:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
