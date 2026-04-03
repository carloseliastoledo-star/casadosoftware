import { defineEventHandler, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'

const FEATURED_IMAGE = 'https://pub-388810139d004c3eb59d2d54c6e92aa7.r2.dev/uploads/1772999710931-office365.jpg'

const PRODUCT_URL = 'https://casadosoftware.com.br/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive?utm_source=blog&utm_medium=article&utm_campaign=office-365-expirou-como-ativar'

const CLEAN_HTML = `<section class="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-12 px-6 text-center rounded-xl mb-6">
  <p class="text-lg md:text-xl opacity-90 font-semibold">
    Ative em menos de 5 minutos e volte a usar Word, Excel e PowerPoint agora.
  </p>
  <a data-cta="office-cta-1" href="${PRODUCT_URL}" class="inline-block mt-6 bg-white text-blue-700 px-8 py-4 rounded-xl font-extrabold text-lg shadow-lg">
    🔓 ATIVAR AGORA
  </a>
  <p class="mt-3 text-sm opacity-80">
    ✔ Entrega imediata ✔ Sem mensalidade ✔ Funciona em vários dispositivos
  </p>
</section>

<section class="py-10 px-6 max-w-3xl mx-auto text-center">
  <h2 class="text-2xl font-bold">Mais de 5.000 ativações realizadas com sucesso</h2>
  <p class="mt-3 text-gray-600">Solução segura, rápida e sem risco de bloqueio.</p>
</section>

<section class="bg-gray-50 py-10 px-6 rounded-xl">
  <div class="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 text-center">
    <div>
      <div class="text-3xl">⚡</div>
      <p class="mt-2 font-bold">Ativação imediata</p>
      <p class="text-sm text-gray-600">Receba e ative na hora</p>
    </div>
    <div>
      <div class="text-3xl">🔒</div>
      <p class="mt-2 font-bold">Licença original</p>
      <p class="text-sm text-gray-600">Sem risco de bloqueio</p>
    </div>
    <div>
      <div class="text-3xl">💻</div>
      <p class="mt-2 font-bold">Multiplataforma</p>
      <p class="text-sm text-gray-600">PC, Mac, Android e iOS</p>
    </div>
  </div>
</section>

<section class="py-12 px-6 text-center">
  <h2 class="text-2xl md:text-3xl font-extrabold">Resolva agora e volte a trabalhar normalmente</h2>
  <a data-cta="office-cta-2" href="${PRODUCT_URL}" class="inline-block mt-6 bg-blue-600 text-white px-8 py-4 rounded-xl font-extrabold text-lg shadow-lg">
    🚀 COMPRAR LICENÇA AGORA
  </a>
</section>

<section class="bg-red-50 py-8 px-6 text-center rounded-xl">
  <p class="text-lg font-bold text-red-600">⚠️ Não perca acesso aos seus arquivos</p>
  <p class="text-gray-700 mt-2">O Office sem licença pode bloquear edição e salvar seus documentos.</p>
</section>

<section class="py-10 px-6 max-w-3xl mx-auto">
  <h2 class="text-xl font-bold mb-4">Dúvidas comuns</h2>
  <div class="space-y-4 text-sm text-gray-700">
    <p><strong>Funciona na hora?</strong><br>Sim, ativação imediata após compra.</p>
    <p><strong>Precisa pagar mensalidade?</strong><br>Não, pagamento único.</p>
    <p><strong>Posso usar em mais de um dispositivo?</strong><br>Sim, compatível com múltiplos dispositivos.</p>
  </div>
</section>

<div class="bg-blue-600 text-white p-6 rounded-xl text-center mt-6">
  <p class="font-bold text-xl">🔥 Ative seu Office agora</p>
  <p>Resolva o problema hoje com envio automático e ativação rápida.</p>
  <a data-cta="office-cta-3" href="${PRODUCT_URL}" class="inline-block mt-4 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold">
    ATIVAR AGORA
  </a>
</div>`

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const slug = 'office-365-expirou-como-ativar'
  const errors: string[] = []

  // Step 1: Find the post
  let post: any
  try {
    post = await (prisma as any).blogPost.findUnique({
      where: { slug },
      select: { id: true, html: true, featuredImage: true }
    })
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: `findUnique failed: ${err.message}` })
  }

  if (!post) {
    throw createError({ statusCode: 404, statusMessage: `Post com slug "${slug}" nao encontrado` })
  }

  // Step 2: Update html + featuredImage on main post
  let updated: any
  try {
    updated = await (prisma as any).blogPost.update({
      where: { id: post.id },
      data: { html: CLEAN_HTML, featuredImage: FEATURED_IMAGE },
      select: { id: true, slug: true, html: true, featuredImage: true }
    })
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: `update failed: ${err.message}` })
  }

  // Step 3: Also update ALL translations that have dirty HTML
  let translationsUpdated = 0
  try {
    const translations = await (prisma as any).blogPostTranslation.findMany({
      where: { postId: post.id },
      select: { id: true, lang: true, html: true }
    })
    for (const tr of translations) {
      if (tr.html && (
        tr.html.includes('<template') ||
        tr.html.includes('<h1') ||
        tr.html.includes('SEU_LINK_AQUI') ||
        tr.html.includes('min-h-screen')
      )) {
        await (prisma as any).blogPostTranslation.update({
          where: { id: tr.id },
          data: { html: CLEAN_HTML, featuredImage: FEATURED_IMAGE }
        })
        translationsUpdated++
      }
    }
  } catch (err: any) {
    errors.push(`translations update failed: ${err.message}`)
  }

  // Step 4: Read-after-write verification
  let verified: any
  try {
    verified = await (prisma as any).blogPost.findUnique({
      where: { id: post.id },
      select: { html: true, featuredImage: true }
    })
  } catch (err: any) {
    errors.push(`read-after-write failed: ${err.message}`)
  }

  const savedHtml = verified?.html || updated?.html || ''
  const savedImage = verified?.featuredImage || updated?.featuredImage || ''

  const checks = {
    hasTemplate: savedHtml.includes('<template'),
    hasInternalH1: /<h1[\s>]/i.test(savedHtml),
    hasSeuLinkAqui: savedHtml.includes('SEU_LINK_AQUI'),
    hasMinHScreen: savedHtml.includes('min-h-screen'),
    hasScriptSetup: savedHtml.includes('<script'),
    ctaCount: (savedHtml.match(/data-cta=/g) || []).length,
    allCtasPointToProduct: (savedHtml.match(/data-cta=/g) || []).length === (savedHtml.match(/https:\/\/casadosoftware\.com\.br\/produto\//g) || []).length,
    featuredImageFixed: savedImage === FEATURED_IMAGE,
    htmlLength: savedHtml.length,
    htmlPreview: savedHtml.substring(0, 200)
  }

  const allGood = !checks.hasTemplate
    && !checks.hasInternalH1
    && !checks.hasSeuLinkAqui
    && !checks.hasMinHScreen
    && !checks.hasScriptSetup
    && checks.ctaCount === 3
    && checks.allCtasPointToProduct
    && checks.featuredImageFixed

  return {
    ok: allGood,
    postId: post.id,
    slug,
    previousHtmlLength: (post.html || '').length,
    previousFeaturedImage: post.featuredImage,
    translationsUpdated,
    checks,
    errors: errors.length ? errors : undefined,
    message: allGood ? 'Post atualizado e verificado com sucesso' : 'ATENCAO: algum check falhou'
  }
})
