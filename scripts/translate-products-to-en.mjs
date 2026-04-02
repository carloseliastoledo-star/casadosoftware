/**
 * translate-products-to-en.mjs
 * Clears broken EN fields in Produto and re-translates from clean PT originals via DeepL.
 *
 * Usage:
 *   $env:DATABASE_URL="mysql://..."
 *   $env:DEEPL_API_KEY="your-key:fx"
 *   node scripts/translate-products-to-en.mjs
 *
 * Options:
 *   --dry-run      List products that would be fixed without writing
 *   --slug=xxx     Process only one product
 *   --force        Re-translate even if EN field looks clean
 */

import { PrismaClient } from '@prisma/client'
import https from 'https'
import { URL } from 'url'

const prisma = new PrismaClient()
const DEEPL_KEY = process.env.DEEPL_API_KEY || ''
const DRY_RUN   = process.argv.includes('--dry-run')
const FORCE     = process.argv.includes('--force')
const ONLY_SLUG = (process.argv.find(a => a.startsWith('--slug=')) || '').replace('--slug=', '')

if (!DEEPL_KEY) { console.error('ERROR: DEEPL_API_KEY missing'); process.exit(1) }

const DEEPL_URL = DEEPL_KEY.endsWith(':fx')
  ? 'https://api-free.deepl.com/v2/translate'
  : 'https://api.deepl.com/v2/translate'

const BROKEN_RE = /[\u0192\u00AD\u251C\u252C]/

async function deepl(text, { html = false } = {}) {
  if (!text || !text.trim()) return text

  const body = new URLSearchParams({
    text,
    source_lang: 'PT',
    target_lang: 'EN-US',
    ...(html ? { tag_handling: 'html' } : {})
  }).toString()

  return new Promise((resolve, reject) => {
    const url = new URL(DEEPL_URL)
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        if (res.statusCode !== 200) { reject(new Error(`DeepL HTTP ${res.statusCode}: ${data}`)); return }
        try { resolve(JSON.parse(data).translations?.[0]?.text || text) }
        catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

function isBroken(s) { return typeof s === 'string' && BROKEN_RE.test(s) }
function isHtml(s)   { return typeof s === 'string' && /<[a-z][\s\S]*>/i.test(s) }

async function main() {
  const all = await prisma.produto.findMany({
    where: ONLY_SLUG ? { slug: ONLY_SLUG } : undefined,
    select: {
      id: true, slug: true,
      descricao: true, descricaoEn: true,
      tutorialTitulo: true, tutorialTituloEn: true,
      tutorialSubtitulo: true, tutorialSubtituloEn: true,
      tutorialConteudo: true, tutorialConteudoEn: true,
    }
  })

  const toFix = all.filter(p =>
    FORCE ||
    isBroken(p.descricaoEn) ||
    isBroken(p.tutorialTituloEn) ||
    isBroken(p.tutorialSubtituloEn) ||
    isBroken(p.tutorialConteudoEn)
  )

  console.log(`\nProdutos a corrigir: ${toFix.length} / ${all.length}`)

  if (DRY_RUN) {
    for (const p of toFix) {
      const broken = []
      if (isBroken(p.descricaoEn))        broken.push('descricaoEn')
      if (isBroken(p.tutorialTituloEn))   broken.push('tutorialTituloEn')
      if (isBroken(p.tutorialSubtituloEn))broken.push('tutorialSubtituloEn')
      if (isBroken(p.tutorialConteudoEn)) broken.push('tutorialConteudoEn')
      console.log(` - ${p.slug}: ${broken.join(', ')}`)
    }
    return
  }

  let done = 0
  for (const p of toFix) {
    console.log(`\n[${done + 1}/${toFix.length}] ${p.slug}`)

    const update = {}

    try {
      // descricaoEn
      if (FORCE || isBroken(p.descricaoEn)) {
        const src = p.descricao?.trim()
        if (src) {
          update.descricaoEn = await deepl(src, { html: isHtml(src) })
          console.log(`  descricaoEn: ${update.descricaoEn.slice(0, 60)}`)
          await sleep(350)
        } else {
          update.descricaoEn = null
        }
      }

      // tutorialTituloEn
      if (FORCE || isBroken(p.tutorialTituloEn)) {
        const src = p.tutorialTitulo?.trim()
        if (src) {
          update.tutorialTituloEn = await deepl(src, { html: false })
          console.log(`  tutorialTituloEn: ${update.tutorialTituloEn.slice(0, 60)}`)
          await sleep(350)
        } else {
          update.tutorialTituloEn = null
        }
      }

      // tutorialSubtituloEn
      if (FORCE || isBroken(p.tutorialSubtituloEn)) {
        const src = p.tutorialSubtitulo?.trim()
        if (src) {
          update.tutorialSubtituloEn = await deepl(src, { html: false })
          console.log(`  tutorialSubtituloEn: ${update.tutorialSubtituloEn.slice(0, 60)}`)
          await sleep(350)
        } else {
          update.tutorialSubtituloEn = null
        }
      }

      // tutorialConteudoEn
      if (FORCE || isBroken(p.tutorialConteudoEn)) {
        const src = p.tutorialConteudo?.trim()
        if (src) {
          update.tutorialConteudoEn = await deepl(src, { html: isHtml(src) })
          console.log(`  tutorialConteudoEn: ${update.tutorialConteudoEn.slice(0, 60)}`)
          await sleep(350)
        } else {
          update.tutorialConteudoEn = null
        }
      }

      if (Object.keys(update).length > 0) {
        await prisma.produto.update({ where: { id: p.id }, data: update })
        done++
      }
    } catch (err) {
      console.error(`  ERROR on ${p.slug}:`, err.message)
      await sleep(1000)
    }
  }

  console.log(`\n✓ Done. Fixed ${done}/${toFix.length} products.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
