import { defineEventHandler } from 'h3'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

export default defineEventHandler(async (_event) => {
  const bucket = String(process.env.SPACES_BUCKET || '').trim()
  const region = String(process.env.SPACES_REGION || '').trim()
  const endpoint = String(process.env.SPACES_ENDPOINT || '').trim()
  const accessKeyId = String(process.env.SPACES_KEY || '').trim()
  const secretAccessKey = String(process.env.SPACES_SECRET || '').trim()
  const publicBaseUrl = String(process.env.SPACES_PUBLIC_BASE_URL || '').trim()

  const envCheck = {
    SPACES_BUCKET: bucket || 'NOT SET',
    SPACES_REGION: region || 'NOT SET',
    SPACES_ENDPOINT: endpoint || 'NOT SET',
    SPACES_KEY: accessKeyId ? `set (${accessKeyId.substring(0, 6)}...)` : 'NOT SET',
    SPACES_SECRET: secretAccessKey ? 'set' : 'NOT SET',
    SPACES_PUBLIC_BASE_URL: publicBaseUrl || 'NOT SET',
    allConfigured: Boolean(bucket && endpoint && accessKeyId && secretAccessKey)
  }

  if (!envCheck.allConfigured) {
    return { ok: false, envCheck, error: 'Variáveis SPACES incompletas' }
  }

  try {
    const client = new S3Client({
      region: 'us-east-1',
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey }
    })

    const response = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 3, Prefix: 'uploads/' })
    )

    const samplePublicUrl = publicBaseUrl
      ? `${publicBaseUrl.replace(/\/+$/, '')}/uploads/sample.jpg`
      : `${endpoint.replace(/\/+$/, '')}/${bucket}/uploads/sample.jpg`

    return {
      ok: true,
      envCheck,
      bucketAccessible: true,
      objectCount: response.KeyCount ?? 0,
      sampleObjects: (response.Contents || []).map(o => o.Key),
      samplePublicUrl
    }
  } catch (err: any) {
    return {
      ok: false,
      envCheck,
      bucketAccessible: false,
      error: err?.message || 'S3 connection failed',
      code: err?.Code || err?.code,
      httpStatusCode: err?.$metadata?.httpStatusCode
    }
  }
})
