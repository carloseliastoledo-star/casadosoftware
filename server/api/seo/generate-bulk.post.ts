import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../db/prisma.js'
import { sanitizeRichHtml } from '../../utils/sanitizeRichHtml.js'
import { requireSeoOrAdmin } from '../../utils/seoAuth.js'

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
- perguntas frequentes
- conclusão

Inclua dicas práticas e explique de forma clara.`

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

function appendProductCtaBlock(): string {
  return [
    '<div class="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-10">',
    '<h2>Comprar licença com envio imediato</h2>',
    '<p>Confira nossas opções recomendadas:</p>',
    '<ul>',
    '<li><a href="/produto/windows-11-pro">Windows 11 Pro</a></li>',
    '<li><a href="/produto/office-365">Office 365</a></li>',
    '</ul>',
    '</div>'
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

async function generateOne(params: { keyword: string; published: boolean; model: string; force: boolean }) {
  const prismaAny = prisma as any

  if (!params.force) {
    const existing = await prismaAny.blogPost.findFirst({
      where: { keyword: params.keyword },
      select: { id: true, slug: true }
    })
    if (existing?.slug) {
      return { skipped: true as const, ...existing }
    }
  }

  const slug = await createUniqueSlug(params.keyword)

  const rawHtml = await callOpenAIHtmlArticle({ keyword: params.keyword, model: params.model })
  const withCta = `${rawHtml}\n${appendProductCtaBlock()}`

  const cleanedHtml = sanitizeRichHtml(withCta, { allowIframes: true })
  const excerpt = excerptFromHtml(cleanedHtml)

  const post = await prismaAny.blogPost.create({
    data: {
      titulo: params.keyword,
      slug,
      html: cleanedHtml,
      excerpt: excerpt || null,
      keyword: params.keyword,
      publicado: params.published
    },
    select: {
      id: true,
      slug: true,
      titulo: true,
      publicado: true,
      criadoEm: true
    }
  })

  return { skipped: false as const, ...post }
}

export default defineEventHandler(async (event) => {
  requireSeoOrAdmin(event)

  const body = await readBody(event)
  const keywords = Array.isArray(body?.keywords) ? body.keywords : null
  if (!keywords) throw createError({ statusCode: 400, statusMessage: 'keywords deve ser uma lista' })

  const model = String(body?.model || 'gpt-4o-mini').trim() || 'gpt-4o-mini'
  const published = body?.published === undefined ? true : Boolean(body?.published)
  const force = Boolean(body?.force)

  const cleaned = keywords
    .map((k: any) => String(k || '').trim())
    .filter((k: string) => Boolean(k))

  if (!cleaned.length) throw createError({ statusCode: 400, statusMessage: 'keywords vazia' })

  const results: Array<{ keyword: string; ok: boolean; slug?: string; id?: string; skipped?: boolean; error?: string }> = []

  for (const keyword of cleaned) {
    try {
      const post = await generateOne({ keyword, published, model, force })
      if ((post as any).skipped) {
        results.push({ keyword, ok: true, slug: (post as any).slug, id: (post as any).id, skipped: true })
      } else {
        results.push({ keyword, ok: true, slug: (post as any).slug, id: (post as any).id })
      }
    } catch (err: any) {
      results.push({ keyword, ok: false, error: err?.data?.statusMessage || err?.message || 'Erro ao gerar' })
    }
  }

  return { ok: true, results }
})
