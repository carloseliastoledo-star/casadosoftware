/**
 * translate-blog-to-en.mjs
 * Translates all BlogPost records (without EN translation) to English
 * using the DeepL Free API and saves to BlogPostTranslation with lang='en'.
 *
 * Usage:
 *   $env:DATABASE_URL="mysql://..."
 *   $env:DEEPL_API_KEY="your-key:fx"
 *   node scripts/translate-blog-to-en.mjs
 *
 * Options:
 *   --dry-run   Print what would be translated without writing to DB
 *   --slug=xxx  Translate only one specific post
 */

import { PrismaClient } from '@prisma/client'
import https from 'https'
import { URL } from 'url'

const prisma = new PrismaClient()
const DEEPL_KEY = process.env.DEEPL_API_KEY || ''
const DRY_RUN   = process.argv.includes('--dry-run')
const ONLY_SLUG = (process.argv.find(a => a.startsWith('--slug=')) || '').replace('--slug=', '')

if (!DEEPL_KEY) {
  console.error('ERROR: DEEPL_API_KEY env var is missing.')
  process.exit(1)
}

// DeepL Free API endpoint (note: api-free.deepl.com for :fx keys)
const DEEPL_URL = DEEPL_KEY.endsWith(':fx')
  ? 'https://api-free.deepl.com/v2/translate'
  : 'https://api.deepl.com/v2/translate'

/**
 * Translate a string (plain text or HTML) using DeepL.
 * tag_handling='html' preserves HTML tags correctly.
 */
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
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`DeepL HTTP ${res.statusCode}: ${data}`))
          return
        }
        try {
          const json = JSON.parse(data)
          resolve(json.translations?.[0]?.text || text)
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

/** Sleep to respect rate limits */
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function main() {
  // Fetch all posts (with existing EN translations noted)
  const posts = await prisma.blogPost.findMany({
    where: ONLY_SLUG ? { slug: ONLY_SLUG } : undefined,
    select: {
      id: true, slug: true, titulo: true, excerpt: true, html: true,
      translations: { select: { lang: true } }
    }
  })

  const toTranslate = posts.filter(p =>
    !p.translations.some(t => String(t.lang).toLowerCase() === 'en')
  )

  console.log(`\nPosts sem tradução EN: ${toTranslate.length} / ${posts.length}`)
  if (DRY_RUN) {
    console.log('\n[DRY RUN] Posts que seriam traduzidos:')
    for (const p of toTranslate) console.log(' -', p.slug)
    return
  }

  let done = 0
  for (const post of toTranslate) {
    console.log(`\n[${done + 1}/${toTranslate.length}] Translating: ${post.slug}`)

    try {
      const [titulo, excerpt, html] = await Promise.all([
        deepl(post.titulo, { html: false }),
        post.excerpt ? deepl(post.excerpt, { html: false }) : Promise.resolve(null),
        post.html    ? deepl(post.html,    { html: true  }) : Promise.resolve(null),
      ])

      console.log(`  titulo: ${titulo?.slice(0, 60)}`)

      await prisma.blogPostTranslation.upsert({
        where: { postId_lang: { postId: post.id, lang: 'en' } },
        update: { titulo, excerpt, html },
        create: { postId: post.id, lang: 'en', titulo, excerpt, html }
      })

      done++
      // Respect DeepL rate limit: ~10 requests/sec on free tier
      await sleep(400)
    } catch (err) {
      console.error(`  ERROR on ${post.slug}:`, err.message)
      // Continue with next post
      await sleep(1000)
    }
  }

  console.log(`\n✓ Done. Translated ${done}/${toTranslate.length} posts.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
