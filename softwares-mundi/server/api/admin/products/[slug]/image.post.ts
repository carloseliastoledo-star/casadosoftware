import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createError, defineEventHandler, getHeader, getRouterParam, readMultipartFormData } from 'h3'
import { setProductOverride } from '~~/server/utils/productOverrides'

function extFromFilename(name: string) {
  const ext = path.extname(name || '').toLowerCase()
  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.webp' || ext === '.svg') return ext
  return ''
}

export default defineEventHandler(async (event) => {
  const adminToken = process.env.ADMIN_TOKEN
  if (adminToken) {
    const auth = String(getHeader(event, 'authorization') || '')
    const token = auth.replace(/^Bearer\s+/i, '').trim()
    if (!token || token !== adminToken) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
  }

  const slug = String(getRouterParam(event, 'slug') || '').trim()
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const form = await readMultipartFormData(event)
  if (!form?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Missing form data' })
  }

  const file = form.find((p) => p.name === 'image' && 'data' in p && (p as any).data)
  if (!file || !('data' in file) || !file.data || !file.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Missing image file' })
  }

  const maxBytes = 5 * 1024 * 1024
  const data = file.data as any
  const size = Buffer.isBuffer(data) ? data.byteLength : Buffer.byteLength(data)
  if (size > maxBytes) {
    throw createError({ statusCode: 413, statusMessage: 'File too large (max 5MB)' })
  }

  const original = String(file.filename || '')
  const ext = extFromFilename(original) || '.png'
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  const filename = `${safeSlug}-${Date.now()}${ext}`

  const publicDir = path.join(process.cwd(), 'public', 'uploads', 'products')
  await fs.mkdir(publicDir, { recursive: true })

  const absPath = path.join(publicDir, filename)
  await fs.writeFile(absPath, data)

  const imageUrl = `/uploads/products/${filename}`
  await setProductOverride(slug, { imageUrl })

  if (process.env.NODE_ENV !== 'production') {
    return { imageUrl, debug: { cwd: process.cwd(), absPath } }
  }

  return { imageUrl }
})
