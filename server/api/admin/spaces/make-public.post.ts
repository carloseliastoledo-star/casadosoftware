import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdminSession } from '../../../utils/adminSession'
import {
  ListObjectsV2Command,
  PutBucketPolicyCommand,
  PutObjectAclCommand,
  S3Client
} from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body: any = await readBody(event)
  const prefix = String(body?.prefix || 'uploads/').trim() || 'uploads/'
  const dryRun = body?.dryRun !== false
  const mode = String(body?.mode || 'policy').trim().toLowerCase() as 'policy' | 'acl'
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

  if (mode === 'policy') {
    if (dryRun) {
      return {
        ok: true,
        dryRun,
        mode,
        bucket,
        prefix,
        message: 'Dry-run: nenhuma policy foi aplicada'
      }
    }

    const resource = `arn:aws:s3:::${bucket}/${prefix}*`
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadUploads',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [resource]
        }
      ]
    }

    try {
      await client.send(
        new PutBucketPolicyCommand({
          Bucket: bucket,
          Policy: JSON.stringify(policy)
        })
      )

      return {
        ok: true,
        dryRun,
        mode,
        bucket,
        prefix,
        resource,
        message: 'Bucket policy aplicada: leitura pública liberada para o prefixo'
      }
    } catch (err: any) {
      console.error('[admin][spaces][make-public][policy] failed', {
        message: err?.message,
        name: err?.name,
        code: err?.Code || err?.code,
        httpStatusCode: err?.$metadata?.httpStatusCode,
        bucket,
        prefix
      })

      const code = err?.Code || err?.code
      const httpStatusCode = err?.$metadata?.httpStatusCode

      throw createError({
        statusCode: 500,
        statusMessage:
          err?.message
            ? `Falha ao aplicar Bucket Policy no Spaces: ${err.message} (code=${code || 'n/a'} http=${httpStatusCode || 'n/a'})`
            : `Falha ao aplicar Bucket Policy no Spaces (code=${code || 'n/a'} http=${httpStatusCode || 'n/a'})`,
        data: {
          code,
          httpStatusCode
        }
      })
    }
  }

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
      mode,
      bucket,
      prefix,
      scanned,
      updated: dryRun ? 0 : updated,
      sampleKeys: updatedKeys
    }
  } catch (err: any) {
    console.error('[admin][spaces][make-public][acl] failed', {
      message: err?.message,
      name: err?.name,
      code: err?.Code || err?.code,
      httpStatusCode: err?.$metadata?.httpStatusCode,
      bucket,
      prefix
    })

    const code = err?.Code || err?.code
    const httpStatusCode = err?.$metadata?.httpStatusCode

    throw createError({
      statusCode: 500,
      statusMessage:
        err?.message
          ? `Falha ao atualizar ACL no Spaces: ${err.message} (code=${code || 'n/a'} http=${httpStatusCode || 'n/a'})`
          : `Falha ao atualizar ACL no Spaces. Tente modo policy: { mode: "policy" } (code=${code || 'n/a'} http=${httpStatusCode || 'n/a'})`,
      data: {
        code,
        httpStatusCode
      }
    })
  }
})
