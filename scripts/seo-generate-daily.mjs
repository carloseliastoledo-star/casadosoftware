import fs from 'node:fs/promises'
import path from 'node:path'

function getEnv(name, fallback = '') {
  return String(process.env[name] ?? fallback).trim()
}

function parseDate(input) {
  const s = String(input || '').trim()
  if (!s) return null
  const d = new Date(s)
  return Number.isFinite(d.getTime()) ? d : null
}

async function main() {
  const baseUrl = getEnv('SEO_BASE_URL', 'http://localhost:3000').replace(/\/$/, '')
  const secret = getEnv('SEO_CRON_SECRET', '')

  if (!secret) {
    throw new Error('SEO_CRON_SECRET não configurado (necessário para rodar via cron)')
  }

  const repoRoot = path.resolve(process.cwd())
  const keywordsPath = path.join(repoRoot, 'data', 'keywords.json')

  const raw = await fs.readFile(keywordsPath, 'utf8')
  const keywords = JSON.parse(raw)
  if (!Array.isArray(keywords)) {
    throw new Error('data/keywords.json deve ser um array de strings')
  }

  const cleaned = keywords.map((k) => String(k || '').trim()).filter(Boolean)
  if (!cleaned.length) {
    throw new Error('Nenhuma keyword encontrada em data/keywords.json')
  }

  const perDay = Number.parseInt(getEnv('SEO_POSTS_PER_DAY', '5'), 10)
  const startDate = parseDate(getEnv('SEO_START_DATE', '')) || new Date('2026-01-01T00:00:00Z')

  const now = new Date()
  const dayIndex = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / 86400000))

  const start = dayIndex * perDay
  const slice = cleaned.slice(start, start + perDay)

  if (!slice.length) {
    console.log('Sem mais keywords para gerar (fim da lista).')
    return
  }

  const res = await fetch(`${baseUrl}/api/seo/generate-bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-seo-cron-secret': secret
    },
    body: JSON.stringify({
      keywords: slice,
      published: true,
      model: getEnv('OPENAI_MODEL', 'gpt-4o-mini'),
      force: false
    })
  })

  const txt = await res.text()
  if (!res.ok) {
    throw new Error(`Erro HTTP ${res.status}: ${txt}`)
  }

  const json = JSON.parse(txt)
  console.log(JSON.stringify(json, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
