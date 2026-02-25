import prisma from '#root/server/db/prisma'
import { requireAdminSession } from '#root/server/utils/adminSession'
import { createError, readBody } from 'h3'
import { autoTranslateText } from '#root/server/utils/autoTranslate'

type Lang = 'en' | 'es' | 'it' | 'fr'

type Body = {
  overwrite?: boolean
  langs?: Lang[]
  limit?: number
  onlyActive?: boolean
  slugs?: string[]
}

function isBlank(value: unknown): boolean {
  return typeof value !== 'string' || value.trim() === ''
}

function normalizeLangs(input: unknown): Lang[] {
  if (!Array.isArray(input)) return ['en', 'es', 'it', 'fr']
  const langs = input
    .map((x) => String(x).trim().toLowerCase())
    .filter((x): x is Lang => x === 'en' || x === 'es' || x === 'it' || x === 'fr')
  return langs.length ? langs : ['en', 'es', 'it', 'fr']
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  const worker = async () => {
    while (true) {
      const current = nextIndex
      nextIndex += 1
      if (current >= items.length) return
      results[current] = await fn(items[current] as T, current)
    }
  }

  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, () => worker())
  await Promise.all(workers)
  return results
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body = (await readBody<Body>(event).catch(() => ({} as Body))) || ({} as Body)

  const overwrite = Boolean(body.overwrite)
  const langs = normalizeLangs(body.langs)
  const onlyActive = body.onlyActive !== false
  const limit = Math.max(1, Math.min(Number(body.limit || 0) || 500, 5000))

  const slugsFilter = Array.isArray(body.slugs)
    ? body.slugs
      .map((s) => String(s).trim().toLowerCase())
      .filter(Boolean)
    : []

  if (slugsFilter.length > 0 && slugsFilter.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Muitos slugs (máximo 200)' })
  }

  const products = await (prisma as any).produto.findMany({
    where: {
      ...(onlyActive ? { ativo: true } : {}),
      ...(slugsFilter.length ? { slug: { in: slugsFilter } } : {})
    },
    take: limit,
    select: {
      id: true,
      slug: true,
      ativo: true,
      nome: true,
      nomeEn: true,
      nomeEs: true,
      nomeIt: true,
      nomeFr: true,
      descricao: true,
      descricaoEn: true,
      descricaoEs: true,
      descricaoIt: true,
      descricaoFr: true,
      tutorialTitulo: true,
      tutorialTituloEn: true,
      tutorialTituloEs: true,
      tutorialTituloIt: true,
      tutorialTituloFr: true,
      tutorialSubtitulo: true,
      tutorialSubtituloEn: true,
      tutorialSubtituloEs: true,
      tutorialSubtituloIt: true,
      tutorialSubtituloFr: true,
      tutorialConteudo: true,
      tutorialConteudoEn: true,
      tutorialConteudoEs: true,
      tutorialConteudoIt: true,
      tutorialConteudoFr: true
    },
    orderBy: { criadoEm: 'desc' }
  })

  const results = await mapWithConcurrency(products, 5, async (product: any) => {
    const data: Record<string, any> = {}

    for (const lang of langs) {
      const suffix = lang === 'en' ? 'En' : lang === 'es' ? 'Es' : lang === 'it' ? 'It' : 'Fr'
      const nameKey = `nome${suffix}`
      const descKey = `descricao${suffix}`
      const ttKey = `tutorialTitulo${suffix}`
      const tsKey = `tutorialSubtitulo${suffix}`
      const tcKey = `tutorialConteudo${suffix}`

      if (overwrite || isBlank(product[nameKey])) {
        const translated = autoTranslateText(product.nome, { lang })
        if (translated && translated.trim()) data[nameKey] = translated
      }

      if (overwrite || isBlank(product[descKey])) {
        const base = typeof product.descricao === 'string' ? product.descricao : ''
        const translated = autoTranslateText(base, { lang })
        if (translated && translated.trim()) data[descKey] = translated
      }

      if (overwrite || isBlank(product[ttKey])) {
        const translated = autoTranslateText(product.tutorialTitulo, { lang })
        if (translated && translated.trim()) data[ttKey] = translated
      }

      if (overwrite || isBlank(product[tsKey])) {
        const translated = autoTranslateText(product.tutorialSubtitulo, { lang })
        if (translated && translated.trim()) data[tsKey] = translated
      }

      if (overwrite || isBlank(product[tcKey])) {
        const translated = autoTranslateText(product.tutorialConteudo, { lang })
        if (translated && translated.trim()) data[tcKey] = translated
      }
    }

    if (!Object.keys(data).length) {
      return { id: product.id, slug: product.slug, updated: false }
    }

    await (prisma as any).produto.update({
      where: { id: product.id },
      data
    })

    return { id: product.id, slug: product.slug, updated: true, fields: Object.keys(data) }
  })

  const updatedCount = results.filter((r: any) => r.updated).length
  const skippedCount = results.length - updatedCount

  return {
    ok: true,
    total: results.length,
    updated: updatedCount,
    skipped: skippedCount,
    limit,
    onlyActive,
    langs,
    results
  }
})
