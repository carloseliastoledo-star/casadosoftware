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
    const endpoint = process.env.SPACES_ENDPOINT || ''
    const accessKeyId = process.env.SPACES_KEY || ''
    const secretAccessKey = process.env.SPACES_SECRET || ''
    const publicBaseUrl = process.env.SPACES_PUBLIC_BASE_URL || ''

    const spacesConfigured = Boolean(bucket && endpoint && accessKeyId && secretAccessKey)

    if (spacesConfigured) {
      try {
        const client = new S3Client({
          region: 'auto',
          endpoint,
          forcePathStyle: false,
          credentials: { accessKeyId, secretAccessKey }
        })

        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.data,
            ContentType: file.type || 'application/octet-stream'
          })
        )

        const url = publicBaseUrl
          ? `${publicBaseUrl.replace(/\/+$/, '')}/${key}`
          : `${endpoint.replace(/\/+$/, '')}/${bucket}/${key}`

        return { url }
      } catch (err: any) {
        console.error('[admin][upload] Spaces upload failed', {
          bucket,
          endpoint,
          hasPublicBaseUrl: Boolean(publicBaseUrl),
          message: err?.message,
          name: err?.name,
          code: err?.Code || err?.code,
          httpStatusCode: err?.$metadata?.httpStatusCode
        })

        throw createError({
          statusCode: 500,
          statusMessage: err?.message ? `Falha ao enviar para o Spaces: ${err.message}` : 'Falha ao enviar para o Spaces'
        })
      }
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Upload não configurado. Configure as variáveis SPACES_BUCKET, SPACES_ENDPOINT, SPACES_KEY e SPACES_SECRET no servidor.'
    })
  } catch (err: any) {
    if (err?.statusCode) throw err
    console.error('[admin][upload] Unexpected failure', { message: err?.message, name: err?.name, stack: err?.stack })
    throw createError({ statusCode: 500, statusMessage: err?.message || 'Erro ao enviar imagem' })
  }
})
