import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { requireAdminSession } from '../../utils/adminSession'

export default defineEventHandler(async (event) => {
  try {
    requireAdminSession(event)

    const formData = await readMultipartFormData(event)

    if (!formData) {
      throw createError({ statusCode: 400, statusMessage: 'Arquivo não enviado' })
    }

    const file = formData.find((f) => f.name === 'file')

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
    const region = process.env.SPACES_REGION || ''
    const endpoint = process.env.SPACES_ENDPOINT || ''
    const accessKeyId = process.env.SPACES_KEY || ''
    const secretAccessKey = process.env.SPACES_SECRET || ''
    const publicBaseUrl = process.env.SPACES_PUBLIC_BASE_URL || ''

    const spacesConfigured = Boolean(bucket && endpoint && accessKeyId && secretAccessKey)

    if (spacesConfigured) {
      try {
        const signingRegion = 'us-east-1'
        const client = new S3Client({
          region: signingRegion,
          endpoint,
          forcePathStyle: true,
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
      } catch (err: any) {
        console.error('[admin][upload] Spaces upload failed', {
          bucket,
          region,
          signingRegion: 'us-east-1',
          endpoint,
          hasPublicBaseUrl: Boolean(publicBaseUrl),
          message: err?.message,
          name: err?.name,
          code: err?.Code || err?.code,
          httpStatusCode: err?.$metadata?.httpStatusCode,
          $metadata: err?.$metadata
        })

        throw createError({
          statusCode: 500,
          statusMessage: err?.message ? `Falha ao enviar para o Spaces: ${err.message}` : 'Falha ao enviar para o Spaces'
        })
      }
    }

    try {
      const outputPublicDir = join(process.cwd(), '.output/public')
      const uploadsBase = existsSync(outputPublicDir) ? outputPublicDir : join(process.cwd(), 'app/public')
      const uploadsDir = join(uploadsBase, 'uploads')
      const filePath = join(uploadsDir, fileName)

      await mkdir(uploadsDir, { recursive: true })
      await writeFile(filePath, file.data)

      return { url: `/uploads/${fileName}` }
    } catch (err: any) {
      console.error('[admin][upload] Local upload failed (no Spaces configured)', {
        message: err?.message,
        name: err?.name
      })

      throw createError({
        statusCode: 500,
        statusMessage:
          'Falha ao salvar imagem no servidor. Configure SPACES_* no deploy para armazenar imagens no DigitalOcean Spaces.'
      })
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    console.error('[admin][upload] Unexpected failure', { message: err?.message, name: err?.name, stack: err?.stack })
    throw createError({ statusCode: 500, statusMessage: err?.message || 'Erro ao enviar imagem' })
  }
})
