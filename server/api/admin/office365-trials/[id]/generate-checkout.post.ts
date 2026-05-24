import { defineEventHandler, createError } from 'h3'
import prisma from '../../../../db/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    const productSlug = process.env.OFFICE365_TRIAL_PRODUCT_SLUG || 'office-365'

    console.log('[generate-checkout] leadId:', id, 'productSlug:', productSlug)

    // Buscar lead no banco
    const leads = await prisma.$queryRawUnsafe(`
      SELECT * FROM Office365TrialLead WHERE id = ? LIMIT 1
    `, id)

    if (!leads || leads.length === 0) {
      console.log('[generate-checkout] lead not found')
      throw createError({
        statusCode: 404,
        statusMessage: 'Lead não encontrado'
      })
    }

    const lead = leads[0]

    if (!lead.email) {
      console.log('[generate-checkout] lead has no email')
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead não possui e-mail'
      })
    }

    // Buscar produto Office 365 pelo slug configurado
    let produto = await (prisma as any).produto.findFirst({
      where: { slug: productSlug, ativo: true },
      select: { id: true, nome: true, preco: true }
    })

    console.log('[generate-checkout] product found by slug:', !!produto)

    // Fallback: buscar por nome se não encontrou pelo slug
    if (!produto) {
      console.log('[generate-checkout] searching by name fallback')
      const produtos = await (prisma as any).produto.findMany({
        where: {
          ativo: true,
          OR: [
            { nome: { contains: 'Office 365' } },
            { nome: { contains: 'Microsoft 365' } }
          ]
        },
        select: { id: true, nome: true, slug: true, preco: true }
      })

      console.log('[generate-checkout] fallback found products:', produtos.length)

      if (produtos.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: `Produto Office 365 não encontrado. Verifique se o slug configurado em OFFICE365_TRIAL_PRODUCT_SLUG existe no banco. Slug usado: ${productSlug}`
        })
      }

      if (produtos.length > 1) {
        const slugs = produtos.map((p: any) => p.slug).join(', ')
        throw createError({
          statusCode: 400,
          statusMessage: `Foram encontrados múltiplos produtos Office 365. Configure OFFICE365_TRIAL_PRODUCT_SLUG com o slug correto. Slugs encontrados: ${slugs}`
        })
      }

      produto = produtos[0]
      console.log('[generate-checkout] using fallback product:', produto.slug)
    }

    // Gerar checkout URL
    const checkoutUrl = `https://casadosoftware.com.br/checkout?produtoId=${produto.id}&email=${encodeURIComponent(lead.email)}&nome=${encodeURIComponent(lead.name)}`

    // Atualizar lead com checkoutUrl
    await prisma.$executeRawUnsafe(`
      UPDATE Office365TrialLead 
      SET checkoutUrl = ?, updatedAt = NOW()
      WHERE id = ?
    `, checkoutUrl, id)

    return {
      success: true,
      checkoutUrl,
      produto: {
        id: produto.id,
        nome: produto.nome,
        slug: produto.slug
      }
    }

  } catch (error: any) {
    console.error('[generate-checkout] error:', error.message)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao gerar checkout'
    })
  }
})
