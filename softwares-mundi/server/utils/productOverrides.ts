import { promises as fs } from 'node:fs'
import path from 'node:path'

export type ProductOverride = {
  imageUrl?: string
}

type OverridesFile = Record<string, ProductOverride>

function storagePath() {
  return path.join(process.cwd(), 'server', 'storage', 'product-overrides.json')
}

async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
}

export async function readProductOverrides(): Promise<OverridesFile> {
  const filePath = storagePath()
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as OverridesFile
  } catch {
    return {}
  }
}

export async function writeProductOverrides(overrides: OverridesFile): Promise<void> {
  const filePath = storagePath()
  await ensureDir(filePath)
  await fs.writeFile(filePath, JSON.stringify(overrides, null, 2), 'utf8')
}

export async function setProductOverride(slug: string, patch: ProductOverride): Promise<OverridesFile> {
  const key = String(slug || '').trim()
  if (!key) return readProductOverrides()

  const current = await readProductOverrides()
  const prev = current[key] || {}
  const next = { ...prev, ...patch }
  const merged = { ...current, [key]: next }
  await writeProductOverrides(merged)
  return merged
}
