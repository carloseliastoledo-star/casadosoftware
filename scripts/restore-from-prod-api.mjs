/**
 * Restores descricao, cardItems, tutorialTitulo, tutorialSubtitulo, tutorialConteudo
 * from the live casadosoftware.com.br API (DigitalOcean) into the Railway database.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BASE = 'https://casadosoftware.com.br'

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'migration-script/1.0' }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

async function main() {
  console.log('Fetching product list from production...')
  const list = await fetchJson(`${BASE}/api/products?lang=pt`)
  console.log(`  Found ${list.length} products\n`)

  let updated = 0

  for (const p of list) {
    if (!p.slug) continue

    // Fetch full product detail (includes tutorialConteudo with includeTutorial=1)
    let detail
    try {
      detail = await fetchJson(`${BASE}/api/products/${p.slug}?lang=pt&includeTutorial=1`)
    } catch (e) {
      console.warn(`  [WARN] Could not fetch detail for "${p.slug}": ${e.message}`)
      detail = null
    }

    const descricao     = detail?.description     || p.description    || null
    const cardItems     = detail?.cardItems        || p.cardItems      || null
    const tutorialTitulo    = detail?.tutorialTitle    || p.tutorialTitle    || null
    const tutorialSubtitulo = detail?.tutorialSubtitle || p.tutorialSubtitle || null
    const tutorialConteudo  = detail?.tutorialContent  || null

    // Only update fields that have data
    const data = {}
    if (descricao)         data.descricao         = descricao
    if (cardItems)         data.cardItems         = cardItems
    if (tutorialTitulo)    data.tutorialTitulo    = tutorialTitulo
    if (tutorialSubtitulo) data.tutorialSubtitulo = tutorialSubtitulo
    if (tutorialConteudo)  data.tutorialConteudo  = tutorialConteudo

    if (!Object.keys(data).length) {
      console.log(`  [SKIP] "${p.slug}" – no data`)
      continue
    }

    try {
      await prisma.produto.updateMany({
        where: { slug: p.slug },
        data,
      })
      const fields = Object.keys(data).join(', ')
      console.log(`  [OK]   "${p.slug}" → updated: ${fields}`)
      updated++
    } catch (e) {
      console.error(`  [ERR]  "${p.slug}": ${e.message}`)
    }
  }

  console.log(`\nDone: ${updated}/${list.length} products updated.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
