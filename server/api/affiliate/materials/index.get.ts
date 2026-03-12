import { defineEventHandler } from 'h3'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const allowedExt = new Set(['.pdf', '.zip', '.png', '.jpg', '.jpeg', '.webp', '.mp4'])

function resolveMaterialsDir(): string {
  const fromEnv = String(process.env.AFFILIATE_MATERIALS_DIR || '').trim()
  if (fromEnv) return fromEnv
  return path.resolve(process.cwd(), 'affiliate-materials')
}

export default defineEventHandler(async () => {
  const dir = resolveMaterialsDir()

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    const files = await Promise.all(
      entries
        .filter((e) => e.isFile())
        .map(async (e) => {
          const fileName = e.name
          const ext = path.extname(fileName).toLowerCase()
          if (!allowedExt.has(ext)) return null

          const fullPath = path.join(dir, fileName)
          const st = await fs.stat(fullPath)

          return {
            id: fileName,
            fileName,
            name: fileName,
            size: st.size,
            updatedAt: st.mtime.toISOString()
          }
        })
    )

    return {
      ok: true,
      items: files.filter(Boolean)
    }
  } catch {
    return { ok: true, items: [] }
  }
})
