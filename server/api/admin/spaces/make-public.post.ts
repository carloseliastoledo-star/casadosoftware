import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdminSession } from '../../../utils/adminSession'
import {
  ListObjectsV2Command,
  PutObjectAclCommand,
  S3Client
} from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body: any = await readBody(event)
  const prefix = String(body?.prefix || 'uploads/').trim() || 'uploads/'
  const dryRun = body?.dryRun !== false
  const maxKeys = Math.min(1000, Math.max(1, Number(body?.maxKeys || 1000)))

  const bucket = String(process.env.SPACES_BUCKET || '').trim()
  const endpoint = String(process.env.SPACES_ENDPOINT || '').trim()
  const accessKeyId = String(process.env.SPACES_KEY || '').trim()
  const secretAccessKey = String(process.env.SPACES_SECRET || '').trim()

  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'SPACES_* não configurado no servidor'
    })
  }

  const client = new S3Client({
    region: 'us-east-1',
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey }
  })

  let continuationToken: string | undefined
  let scanned = 0
  let updated = 0
  const updatedKeys: string[] = []

  try {
    // Paginate objects under prefix
    while (true) {
      const listRes = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
          MaxKeys: maxKeys
        })
      )

      const contents = listRes.Contents || []
      for (const obj of contents) {
        const key = obj.Key
        if (!key) continue
        scanned += 1

        if (!dryRun) {
          await client.send(
            new PutObjectAclCommand({
              Bucket: bucket,
              Key: key,
              ACL: 'public-read'
            })
          )
          updated += 1
        }

        if (updatedKeys.length < 50) updatedKeys.push(key)
      }

      if (!listRes.IsTruncated) break
      continuationToken = listRes.NextContinuationToken
      if (!continuationToken) break
    }

    return {
      ok: true,
      dryRun,
      bucket,
      prefix,
      scanned,
      updated: dryRun ? 0 : updated,
      sampleKeys: updatedKeys
    }
  } catch (err: any) {
    console.error('[admin][spaces][make-public] failed', {
      message: err?.message,
      name: err?.name,
      code: err?.Code || err?.code,
      httpStatusCode: err?.$metadata?.httpStatusCode,
      bucket,
      prefix
    })

    throw createError({
      statusCode: 500,
      statusMessage: err?.message ? `Falha ao atualizar ACL no Spaces: ${err.message}` : 'Falha ao atualizar ACL no Spaces'
    })
  }
})
