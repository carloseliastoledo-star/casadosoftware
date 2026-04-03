/**
 * migrate-images-to-r2.mjs
 * Migrates all product and blog images from DigitalOcean Spaces to Cloudflare R2.
 * Downloads images via public HTTP (no DO credentials needed) and uploads to R2.
 * Updates the database URLs after each successful upload.
 *
 * Required env vars:
 *   DATABASE_URL    Railway MySQL connection string
 *   R2_ACCOUNT_ID   Cloudflare Account ID
 *   R2_ACCESS_KEY   R2 S3 Access Key ID
 *   R2_SECRET_KEY   R2 S3 Secret Access Key
 *   R2_BUCKET       R2 bucket name (default: fotoscasadosoftware)
 *   R2_PUBLIC_URL   Public base URL, e.g. https://pub-xxx.r2.dev
 *
 * Usage:
 *   node scripts/migrate-images-to-r2.mjs
 *   node scripts/migrate-images-to-r2.mjs --dry-run
 */

import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import https from 'https'
import http from 'http'

const prisma = new PrismaClient()
const DRY_RUN = process.argv.includes('--dry-run')

// ── Config ────────────────────────────────────────────────────────────────────
const R2_BUCKET  = process.env.R2_BUCKET     || 'fotoscasadosoftware'
const R2_PUB_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')

const required = ['R2_ACCOUNT_ID','R2_ACCESS_KEY','R2_SECRET_KEY','R2_PUBLIC_URL']
const missing  = required.filter(k => !process.env[k])
if (missing.length) { console.error('Missing env vars:', missing.join(', ')); process.exit(1) }

// ── R2 S3 client ──────────────────────────────────────────────────────────────
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY, secretAccessKey: process.env.R2_SECRET_KEY },
  forcePathStyle: false,
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractKey(url) {
  try {
    const u = new URL(url)
    return u.pathname.replace(/^\//, '')   // e.g. "uploads/xxx.jpg"
  } catch { return null }
}

function guessContentType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif' }
  return map[ext] || 'application/octet-stream'
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve, reject)
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function alreadyInR2(key) {
  try {
    await r2Client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return true
  } catch { return false }
}

async function migrateImage(publicUrl) {
  const key = extractKey(publicUrl)
  if (!key) { console.log(`  SKIP (can't parse key): ${publicUrl}`); return null }

  if (await alreadyInR2(key)) {
    console.log(`  SKIP (already in R2): ${key}`)
    return `${R2_PUB_URL}/${key}`
  }

  const body = await fetchBuffer(publicUrl)
  const ct   = guessContentType(key)

  if (DRY_RUN) {
    console.log(`  [DRY] would upload ${key} (${body.length} bytes, ${ct})`)
    return `${R2_PUB_URL}/${key}`
  }

  await r2Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET, Key: key,
    Body: body, ContentType: ct,
  }))

  console.log(`  ✓ ${key} (${(body.length / 1024).toFixed(1)} KB)`)
  return `${R2_PUB_URL}/${key}`
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const prods = await prisma.produto.findMany({
    select: { id: true, slug: true, imagem: true }
  })
  const posts = await prisma.blogPost.findMany({
    select: { id: true, slug: true, featuredImage: true }
  })
  const postTrs = await prisma.blogPostTranslation.findMany({
    select: { id: true, featuredImage: true }
  })

  const DO_HOST = 'digitaloceanspaces.com'

  const prodTasks  = prods.filter(p => p.imagem?.includes(DO_HOST))
  const postTasks  = posts.filter(p => p.featuredImage?.includes(DO_HOST))
  const trTasks    = postTrs.filter(p => p.featuredImage?.includes(DO_HOST))

  console.log(`\nImages to migrate: ${prodTasks.length} products, ${postTasks.length} blog posts, ${trTasks.length} translations`)
  if (DRY_RUN) console.log('[DRY RUN mode — no writes]\n')

  let ok = 0, fail = 0

  // Products
  for (const p of prodTasks) {
    console.log(`[produto] ${p.slug}`)
    try {
      const newUrl = await migrateImage(p.imagem)
      if (newUrl && !DRY_RUN) {
        await prisma.produto.update({ where: { id: p.id }, data: { imagem: newUrl } })
        ok++
      }
    } catch (e) { console.error(`  ERROR: ${e.message}`); fail++ }
  }

  // Blog posts
  for (const p of postTasks) {
    console.log(`[blog] ${p.slug}`)
    try {
      const newUrl = await migrateImage(p.featuredImage)
      if (newUrl && !DRY_RUN) {
        await prisma.blogPost.update({ where: { id: p.id }, data: { featuredImage: newUrl } })
        ok++
      }
    } catch (e) { console.error(`  ERROR: ${e.message}`); fail++ }
  }

  // BlogPostTranslations
  for (const t of trTasks) {
    console.log(`[blog-tr] id=${t.id}`)
    try {
      const newUrl = await migrateImage(t.featuredImage)
      if (newUrl && !DRY_RUN) {
        await prisma.blogPostTranslation.update({ where: { id: t.id }, data: { featuredImage: newUrl } })
        ok++
      }
    } catch (e) { console.error(`  ERROR: ${e.message}`); fail++ }
  }

  console.log(`\n✓ Done. Migrated: ${ok}  Failed: ${fail}`)
  if (fail === 0 && !DRY_RUN) {
    console.log('\nAll images migrated! You can now cancel DigitalOcean Spaces.')
    console.log('Also update the hardcoded URL in server/api/admin/blog/fix-office-post.post.ts')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
