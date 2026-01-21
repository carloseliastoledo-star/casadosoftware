import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { requireAdminSession } from '../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo não enviado' })
  }

  const file = formData.find(f => f.name === 'file')

  if (!file || !file.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo inválido' })
  }

  const safeFileName = String(file.filename)
    .trim()
    .replace(/\\/g, '-')
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')

  const fileName = `${Date.now()}-${safeFileName}`
  const key = `uploads/${fileName}`

  const bucket = process.env.SPACES_BUCKET || ''
  const region = process.env.SPACES_REGION || 'us-east-1'
  const endpoint = process.env.SPACES_ENDPOINT || ''
  const accessKeyId = process.env.SPACES_KEY || ''
  const secretAccessKey = process.env.SPACES_SECRET || ''
  const publicBaseUrl = process.env.SPACES_PUBLIC_BASE_URL || ''

  const spacesConfigured = Boolean(bucket && endpoint && accessKeyId && secretAccessKey)

  if (spacesConfigured) {
    const client = new S3Client({
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey }
    })

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.data,
        ContentType: file.type || 'application/octet-stream',
        ACL: 'public-read'
      })
    )

    const url = publicBaseUrl
      ? `${publicBaseUrl.replace(/\/+$/, '')}/${key}`
      : `${endpoint.replace(/\/+$/, '')}/${bucket}/${key}`

    return { url }
  }

  const outputPublicDir = join(process.cwd(), '.output/public')
  const uploadsBase = existsSync(outputPublicDir) ? outputPublicDir : join(process.cwd(), 'app/public')
  const uploadsDir = join(uploadsBase, 'uploads')
  const filePath = join(uploadsDir, fileName)

  await mkdir(uploadsDir, { recursive: true })
  await writeFile(filePath, file.data)

  return { url: `/uploads/${fileName}` }
})
