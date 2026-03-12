import { defineEventHandler, getRouterParam, createError, setHeader, sendStream } from 'h3'
import { createReadStream, promises as fs } from 'node:fs'
import path from 'node:path'

const allowedExt = new Set(['.pdf', '.zip', '.png', '.jpg', '.jpeg', '.webp', '.mp4'])

function resolveMaterialsDir(): string {
  const fromEnv = String(process.env.AFFILIATE_MATERIALS_DIR || '').trim()
  if (fromEnv) return fromEnv
  return path.resolve(process.cwd(), 'affiliate-materials')
}

function safeFileName(raw: string) {
  const v = String(raw || '').trim()
  if (!v) return ''
  if (v.includes('..') || v.includes('/') || v.includes('\\')) return ''
  return v
}

export default defineEventHandler(async (event) => {
  const id = safeFileName(String(getRouterParam(event, 'id') || ''))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id inválido' })

  const ext = path.extname(id).toLowerCase()
  if (!allowedExt.has(ext)) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo não permitido' })
  }

  const dir = resolveMaterialsDir()
  const fullPath = path.join(dir, id)

  try {
    const st = await fs.stat(fullPath)
    if (!st.isFile()) throw new Error('not_file')

    setHeader(event, 'Content-Type', 'application/octet-stream')
    setHeader(event, 'Content-Length', String(st.size))
    setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(id)}"`)

    return sendStream(event, createReadStream(fullPath))
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Arquivo não encontrado' })
  }
})
