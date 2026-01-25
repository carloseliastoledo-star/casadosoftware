import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getDefaultProductDescription } from '../../../utils/productDescriptionTemplate'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = event.context.params.id
  const body = await readBody(event)

  const hasGoogleAds = Boolean(body.googleAdsConversionLabel)

  const finalUrlProvided = typeof body.finalUrl === 'string'
  const rawFinalUrl = finalUrlProvided ? body.finalUrl.trim() : ''
  const finalUrl = finalUrlProvided ? (rawFinalUrl ? rawFinalUrl : null) : undefined

  const descricaoProvided = typeof body.descricao === 'string'
  const rawDescricao = descricaoProvided ? body.descricao.trim() : ''

  let descricao: string | undefined
  if (descricaoProvided) {
    descricao = rawDescricao ? rawDescricao : getDefaultProductDescription({ nome: body.nome, slug: body.slug })
  } else {
    descricao = undefined
  }

  const categoriasProvided = Array.isArray(body.categorias)
  const categorias = categoriasProvided ? body.categorias.map((s: any) => String(s).trim()).filter(Boolean) : []

  try {
    return await prisma.produto.update({
      where: { id },
      data: {
        nome: body.nome,
        slug: body.slug,
        ...(finalUrl !== undefined ? { finalUrl } : {}),
        preco: Number(body.preco),
        ...(descricao !== undefined ? { descricao } : {}),
        ativo: body.ativo,
        imagem: body.imagem,
        ...(categoriasProvided
          ? {
              produtoCategorias: {
                deleteMany: {},
                create: categorias.map((slug: string) => ({
                  categoria: { connect: { slug } }
                }))
              }
            }
          : {}),
        ...(hasGoogleAds
          ? {
              googleAdsConversionLabel: body.googleAdsConversionLabel,
              googleAdsConversionValue:
                body.googleAdsConversionValue === null || body.googleAdsConversionValue === undefined || body.googleAdsConversionValue === ''
                  ? null
                  : Number(body.googleAdsConversionValue),
              googleAdsConversionCurrency: body.googleAdsConversionCurrency || 'BRL'
            }
          : {}),
        tutorialTitulo: body.tutorialTitulo,
        tutorialSubtitulo: body.tutorialSubtitulo,
        tutorialConteudo: body.tutorialConteudo
      }
    })
  } catch (err: any) {
    const message = String(err?.message || '')
    throw createError({
      statusCode: message.includes('provided value for the column is too long') && message.includes('Column: descricao') ? 400 : 500,
      statusMessage: message.includes('provided value for the column is too long') && message.includes('Column: descricao')
        ? 'A descrição está muito grande para o limite do banco atual. Aplique a migração para aumentar o campo (descricao -> TEXT).'
        : (message.includes('Unknown column')
            ? 'Banco de dados desatualizado (migração pendente). Rode as migrations em produção.'
            : (err?.message || 'Server Error'))
    })
  }
})
