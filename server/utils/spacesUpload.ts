import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export async function uploadPublicImageToSpaces(params: {
  data: Uint8Array
  contentType: string
  key: string
}): Promise<string | null> {
  const bucket = String(process.env.SPACES_BUCKET || '').trim()
  const endpoint = String(process.env.SPACES_ENDPOINT || '').trim()
  const accessKeyId = String(process.env.SPACES_KEY || '').trim()
  const secretAccessKey = String(process.env.SPACES_SECRET || '').trim()
  const publicBaseUrl = String(process.env.SPACES_PUBLIC_BASE_URL || '').trim()

  const spacesConfigured = Boolean(bucket && endpoint && accessKeyId && secretAccessKey)
  if (!spacesConfigured) return null

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
      Key: params.key,
      Body: params.data,
      ContentType: params.contentType,
      ACL: 'public-read'
    })
  )

  const url = publicBaseUrl
    ? `${publicBaseUrl.replace(/\/+$/, '')}/${params.key}`
    : `${endpoint.replace(/\/+$/, '')}/${bucket}/${params.key}`

  return url
}
