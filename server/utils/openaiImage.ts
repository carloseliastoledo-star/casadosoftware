import { createError } from 'h3'
import { Buffer } from 'node:buffer'

type OpenAIImageResponse = {
  data?: Array<{ b64_json?: string | null; url?: string | null }>
}

export async function generateOpenAiImagePngBytes(params: {
  prompt: string
  model?: string
  size?: '1024x1024' | '1024x1536' | '1536x1024'
}): Promise<Uint8Array> {
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim()
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'OPENAI_API_KEY não configurado' })
  }

  const model = String(params.model || process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1').trim() || 'gpt-image-1'
  const size = params.size || '1536x1024'

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt: params.prompt,
      size,
      response_format: 'b64_json'
    })
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw createError({ statusCode: 500, statusMessage: `OpenAI image error (${res.status}): ${txt || res.statusText}` })
  }

  const json = (await res.json()) as OpenAIImageResponse
  const b64 = String(json?.data?.[0]?.b64_json || '').trim()
  if (!b64) {
    throw createError({ statusCode: 500, statusMessage: 'OpenAI retornou imagem vazia' })
  }

  const buf = Buffer.from(b64, 'base64')
  return new Uint8Array(buf)
}
