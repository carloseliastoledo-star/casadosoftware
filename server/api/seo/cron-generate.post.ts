import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '../../db/prisma.js'
import { sanitizeRichHtml } from '../../utils/sanitizeRichHtml.js'
import { requireSeoOrAdmin } from '../../utils/seoAuth.js'
import { generateOpenAiImagePngBytes } from '../../utils/openaiImage.js'
import { uploadPublicImageToSpaces } from '../../utils/spacesUpload.js'

function toSlug(input: unknown): string {
  return String(input ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function stripHtml(input: unknown): string {
  const raw = String(input ?? '')
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function excerptFromHtml(html: unknown, maxLen = 180): string {
  const txt = stripHtml(html)
  if (!txt) return ''
  if (txt.length <= maxLen) return txt
  return `${txt.slice(0, maxLen).trimEnd()}…`
}

type OpenAIChatResponse = {
  choices?: Array<{ message?: { content?: string | null } }>
}

async function callOpenAIHtmlArticle(params: { keyword: string; model: string }) {
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim()
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'OPENAI_API_KEY não configurado' })
  }

  const prompt = `Escreva um artigo SEO completo em português sobre: ${params.keyword}

Regras:
- Responda APENAS com HTML (sem markdown)
- Use tags: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>
- Não inclua <html>, <head> ou <body>

Estrutura:
- título forte
- introdução
- passo a passo
- dúvidas frequentes
- conclusão

O artigo deve ser claro, otimizado para SEO e conter subtítulos.`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: params.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6
    })
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw createError({ statusCode: 500, statusMessage: `OpenAI error (${res.status}): ${txt || res.statusText}` })
  }

  const json = (await res.json()) as OpenAIChatResponse
  const content = String(json?.choices?.[0]?.message?.content || '').trim()
  if (!content) {
    throw createError({ statusCode: 500, statusMessage: 'OpenAI retornou conteúdo vazio' })
  }

  return content
}

function appendCta(): string {
  return [
    '<hr/>',
    '<p><strong>Compre licença original em:</strong> <a href="https://casadosoftware.com.br">https://casadosoftware.com.br</a></p>'
  ].join('')
}

async function createUniqueSlug(base: string) {
  const baseSlug = toSlug(base)
  if (!baseSlug) throw createError({ statusCode: 400, statusMessage: 'keyword inválida (não gerou slug)' })

  const prismaAny = prisma as any

  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`
    const existing = await prismaAny.blogPost.findUnique({ where: { slug }, select: { id: true } })
    if (!existing) return slug
  }

  return `${baseSlug}-${Date.now()}`
}

async function maybeGenerateFeaturedImage(params: { keyword: string; slug: string; generate: boolean }) {
  if (!params.generate) return null

  try {
    const prompt = `Crie uma imagem de capa (estilo ilustrativo, limpo e profissional) para um artigo sobre: ${params.keyword}. Sem texto, sem logotipos, sem marcas d'água.`
    const bytes = await generateOpenAiImagePngBytes({ prompt, size: '1536x1024' })
    const key = `uploads/blog/${params.slug}-${Date.now()}.png`
    const url = await uploadPublicImageToSpaces({ data: bytes, contentType: 'image/png', key })
    return url || null
  } catch (err: any) {
    console.error('[seo][cron-generate] featured image failed', { message: err?.message, name: err?.name })
    return null
  }
}

export default defineEventHandler(async (event) => {
  requireSeoOrAdmin(event)

  let body: any = null
  try {
    body = await readBody(event)
  } catch {
    body = null
  }

  const keywordsModule = await import('#root/data/keywords.json')
  const keywords = (keywordsModule as any)?.default

  if (!Array.isArray(keywords)) {
    throw createError({ statusCode: 500, statusMessage: 'data/keywords.json inválido (esperado array)' })
  }

  const maxPerRun = 5
  const model = String(process.env.OPENAI_MODEL || 'gpt-4o-mini').trim() || 'gpt-4o-mini'
  const generateImageEnv = String(process.env.SEO_GENERATE_IMAGES || '').trim() === '1'
  const generateImage = body?.generateImage === undefined ? generateImageEnv : Boolean(body?.generateImage)

  const cleaned = keywords.map((k: any) => String(k || '').trim()).filter(Boolean)
  if (!cleaned.length) return { ok: true, created: 0, skipped: 0 }

  const prismaAny = prisma as any

  // pick next keywords not yet generated
  const existing = await prismaAny.blogPost.findMany({
    where: { keyword: { in: cleaned } },
    select: { keyword: true }
  })
  const existingSet = new Set((existing || []).map((p: any) => String(p?.keyword || '').trim()).filter(Boolean))

  const queue = cleaned.filter((k: string) => !existingSet.has(k)).slice(0, maxPerRun)

  let created = 0
  let skipped = 0
  const errors: Array<{ keyword: string; error: string }> = []

  for (const keyword of queue) {
    try {
      const slug = await createUniqueSlug(keyword)

      const featuredImage = await maybeGenerateFeaturedImage({ keyword, slug, generate: generateImage })
      const rawHtml = await callOpenAIHtmlArticle({ keyword, model })
      const withCta = `${rawHtml}\n${appendCta()}`
      const cleanedHtml = sanitizeRichHtml(withCta, { allowIframes: true })
      const excerpt = excerptFromHtml(cleanedHtml)

      await prismaAny.blogPost.create({
        data: {
          titulo: keyword,
          slug,
          featuredImage,
          html: cleanedHtml,
          excerpt: excerpt || null,
          keyword,
          autoSeo: true,
          publicado: true
        },
        select: { id: true }
      })

      created++
    } catch (err: any) {
      skipped++
      errors.push({
        keyword,
        error: String(err?.data?.statusMessage || err?.message || 'Erro ao gerar')
      })
    }
  }

  return { ok: true, created, skipped, errors }
})
