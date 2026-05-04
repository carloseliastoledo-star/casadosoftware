import { defineEventHandler, createError, readMultipartFormData } from 'h3'
import prisma from '#root/server/db/prisma'

function parseCSV(content: string): string[][] {
  const lines: string[][] = []
  let currentLine: string[] = []
  let currentField = ''
  let inQuotes = false
  let i = 0

  while (i < content.length) {
    const char = content[i]
    const nextChar = content[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"'
          i += 2
          continue
        } else {
          inQuotes = false
        }
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        currentLine.push(currentField.trim())
        currentField = ''
      } else if (char === '\n' || char === '\r') {
        if (currentField !== '' || currentLine.length > 0) {
          currentLine.push(currentField.trim())
          if (currentLine.some(f => f !== '')) {
            lines.push(currentLine)
          }
          currentLine = []
          currentField = ''
        }
        // Pular \r\n
        if (char === '\r' && nextChar === '\n') {
          i++
        }
      } else {
        currentField += char
      }
    }
    i++
  }

  // Adicionar último campo/linha
  if (currentField !== '' || currentLine.length > 0) {
    currentLine.push(currentField.trim())
    if (currentLine.some(f => f !== '')) {
      lines.push(currentLine)
    }
  }

  return lines
}

function parseBoolean(value: string): boolean {
  const normalized = String(value).toLowerCase().trim()
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'sim'
}

function parseFloatOrNull(value: string): number | null {
  if (!value || value.trim() === '') return null
  const parsed = parseFloat(value.replace(/[^0-9.,]/g, '').replace(',', '.'))
  return isNaN(parsed) ? null : parsed
}

export default defineEventHandler(async (event) => {
  const result = {
    created: 0,
    updated: 0,
    categoriesCreated: 0,
    errors: [] as string[]
  }

  try {
    // Ler arquivo multipart
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado' })
    }

    const file = formData.find(f => f.name === 'file' || f.filename)
    if (!file || !file.data) {
      throw createError({ statusCode: 400, statusMessage: 'Arquivo CSV não encontrado' })
    }

    const content = file.data.toString('utf-8')
    const lines = parseCSV(content)

    if (lines.length < 2) {
      throw createError({ statusCode: 400, statusMessage: 'CSV vazio ou inválido' })
    }

    // Header e mapeamento de índices
    const headers = lines[0].map(h => h.toLowerCase().trim())
    const getIndex = (name: string) => headers.indexOf(name.toLowerCase())

    const idx = {
      name: getIndex('name'),
      slug: getIndex('slug'),
      description: getIndex('description'),
      shortDescription: getIndex('shortdescription'),
      price: getIndex('price'),
      compareAtPrice: getIndex('compareatprice'),
      costPrice: getIndex('costprice'),
      image: getIndex('image'),
      gallery: getIndex('gallery'),
      category: getIndex('category'),
      stock: getIndex('stock'),
      active: getIndex('active'),
      featured: getIndex('featured'),
      productType: getIndex('producttype'),
      deliveryInstructions: getIndex('deliveryinstructions'),
      googleAdsConversionLabel: getIndex('googleadsconversionlabel'),
      googleAdsConversionValue: getIndex('googleadsconversionvalue'),
      seoTitle: getIndex('seotitle'),
      seoDescription: getIndex('seodescription'),
      seoContent: getIndex('seocontent'),
      cardItems: getIndex('carditems'),
      tutorialTitulo: getIndex('tutorialtitulo'),
      tutorialSubtitulo: getIndex('tutorialsubtitulo'),
      tutorialConteudo: getIndex('tutorialconteudo')
    }

    // Validar campos obrigatórios
    if (idx.name === -1 || idx.slug === -1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'CSV deve conter as colunas: name e slug'
      })
    }

    // Processar cada linha
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i]
      if (row.length < 2) continue

      try {
        const name = row[idx.name]?.trim()
        const slug = row[idx.slug]?.trim().toLowerCase()

        if (!name || !slug) {
          result.errors.push(`Linha ${i + 1}: nome ou slug vazio`)
          continue
        }

        // Extrair dados
        const data = {
          nome: name,
          slug: slug,
          descricao: idx.description >= 0 ? row[idx.description] || null : null,
          preco: idx.price >= 0 ? (parseFloatOrNull(row[idx.price]) || 0) : 0,
          precoAntigo: idx.compareAtPrice >= 0 ? parseFloatOrNull(row[idx.compareAtPrice]) : null,
          imagem: idx.image >= 0 ? row[idx.image] || null : null,
          ativo: idx.active >= 0 ? parseBoolean(row[idx.active]) : true,
          googleAdsConversionLabel: idx.googleAdsConversionLabel >= 0 ? row[idx.googleAdsConversionLabel] || null : null,
          googleAdsConversionValue: idx.googleAdsConversionValue >= 0 ? parseFloatOrNull(row[idx.googleAdsConversionValue]) : null,
          seoTitle: idx.seoTitle >= 0 ? row[idx.seoTitle] || null : null,
          seoDescription: idx.seoDescription >= 0 ? row[idx.seoDescription] || null : null,
          seoContent: idx.seoContent >= 0 ? row[idx.seoContent] || null : null,
          cardItems: idx.cardItems >= 0 ? row[idx.cardItems] || null : null,
          tutorialTitulo: idx.tutorialTitulo >= 0 ? row[idx.tutorialTitulo] || null : null,
          tutorialSubtitulo: idx.tutorialSubtitulo >= 0 ? row[idx.tutorialSubtitulo] || null : null,
          tutorialConteudo: idx.tutorialConteudo >= 0 ? row[idx.tutorialConteudo] || null : null
        }

        // Verificar se produto existe
        const existing = await (prisma as any).produto.findUnique({
          where: { slug },
          select: { id: true }
        })

        let produtoId: string

        if (existing) {
          // Atualizar
          await (prisma as any).produto.update({
            where: { slug },
            data
          })
          produtoId = existing.id
          result.updated++
        } else {
          // Criar
          const created = await (prisma as any).produto.create({
            data
          })
          produtoId = created.id
          result.created++
        }

        // Processar categorias
        if (idx.category >= 0 && row[idx.category]) {
          const categoriaNomes = row[idx.category]
            .split('|')
            .map((c: string) => c.trim())
            .filter(Boolean)

          for (const catNome of categoriaNomes) {
            const catSlug = catNome.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')

            if (!catSlug) continue

            // Buscar ou criar categoria
            let categoria = await (prisma as any).categoria.findUnique({
              where: { slug: catSlug },
              select: { id: true }
            })

            if (!categoria) {
              categoria = await (prisma as any).categoria.create({
                data: {
                  nome: catNome,
                  slug: catSlug,
                  ativo: true
                }
              })
              result.categoriesCreated++
            }

            // Verificar se relação já existe
            const existingRel = await (prisma as any).produtoCategoria.findUnique({
              where: {
                produtoId_categoriaId: {
                  produtoId,
                  categoriaId: categoria.id
                }
              }
            })

            if (!existingRel) {
              await (prisma as any).produtoCategoria.create({
                data: {
                  produtoId,
                  categoriaId: categoria.id
                }
              })
            }
          }
        }
      } catch (err: any) {
        result.errors.push(`Linha ${i + 1}: ${err?.message || 'Erro desconhecido'}`)
      }
    }

    return {
      ok: true,
      ...result,
      totalProcessed: result.created + result.updated
    }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('[api/admin/produtos/import] error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao importar produtos: ' + (error?.message || 'Erro desconhecido')
    })
  }
})
