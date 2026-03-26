import { defineEventHandler, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'

const FEATURED_IMAGE = 'https://fotoscasadosoftware.nyc3.digitaloceanspaces.com/uploads/1772999710931-office365.jpg'

const CLEAN_HTML = `<p><strong>Se o seu Office 365 expirou</strong>, começou a exibir mensagens de produto não licenciado ou bloqueou funções como editar e salvar, você não está sozinho. Esse é um problema comum quando a licença não está mais válida, quando houve falha na ativação ou quando o usuário está usando uma instalação irregular.</p>

<p>Neste guia, você vai entender <strong>por que isso acontece</strong>, como identificar se a licença realmente expirou e qual é a forma mais segura de voltar a usar Word, Excel e PowerPoint sem dor de cabeça.</p>

<h2>Como saber se sua licença do Office expirou</h2>
<p>Alguns sinais aparecem com frequência quando o Microsoft Office perde a ativação:</p>
<ul>
  <li>Mensagem de <strong>Produto Não Licenciado</strong> no topo dos aplicativos</li>
  <li>Aviso pedindo ativação toda vez que o aplicativo abre</li>
  <li>Bloqueio de funções essenciais no Word, Excel ou PowerPoint</li>
  <li>Erro ao salvar ou editar documentos que antes funcionavam normalmente</li>
  <li>Barra amarela ou vermelha informando problema na licença</li>
  <li>Modo de visualização apenas, sem permitir alterações</li>
</ul>

<p>Quando qualquer um desses sinais aparece, significa que o sistema não reconhece mais uma licença válida. Isso pode acontecer por diversos motivos, desde uma assinatura vencida até o uso de uma chave que foi revogada pela Microsoft.</p>

<p>É importante agir rápido. Enquanto o Office está sem licença, você perde acesso a funcionalidades críticas que afetam diretamente sua produtividade no trabalho e nos estudos.</p>

<div class="bg-blue-50 p-4 rounded-xl mt-6 text-center">
  <p class="font-bold text-lg">🔥 Solução rápida para ativar o Office</p>
  <p>Licença original com envio automático e ativação imediata.</p>
  <a data-cta="office-main-1" href="https://casadosoftware.com.br/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive?utm_source=blog&utm_medium=article&utm_campaign=office-365-expirou-como-ativar" class="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
    ATIVAR OFFICE AGORA
  </a>
  <p class="text-sm text-gray-500 mt-2">✔ Envio automático ✔ Licença original ✔ Uso em múltiplos dispositivos</p>
</div>

<h2>Por que o Office para de funcionar?</h2>
<p>O Office 365 depende de uma licença válida para liberar todos os recursos. Quando a assinatura termina, quando a conta associada perde acesso ou quando a chave usada não é legítima, o sistema reduz funcionalidades e começa a exibir alertas.</p>

<p>Os motivos mais comuns são:</p>
<ul>
  <li><strong>Assinatura vencida:</strong> se você usava o Microsoft 365 por assinatura mensal ou anual, o acesso é cortado quando o pagamento não é renovado.</li>
  <li><strong>Chave revogada:</strong> chaves compradas de fontes não confiáveis podem ser revogadas pela Microsoft a qualquer momento, mesmo que tenham funcionado inicialmente.</li>
  <li><strong>Mudança de hardware:</strong> em alguns casos, trocar componentes do computador pode invalidar a ativação existente.</li>
  <li><strong>Uso de ativadores ilegais:</strong> programas como KMSpico, Re-Loader ou similares criam ativações temporárias que podem ser detectadas e removidas por atualizações do Windows.</li>
  <li><strong>Conta Microsoft desvinculada:</strong> se a licença estava associada a uma conta que foi removida ou teve a senha alterada, o Office perde o vínculo.</li>
</ul>

<p>Também é comum isso acontecer com instalações feitas com ativadores, cracks ou chaves de origem duvidosa. Em muitos casos, a ativação até funciona por um tempo, mas depois o problema volta — geralmente após uma atualização do sistema.</p>

<h2>Diferença entre assinatura, licença vitalícia e chave inválida</h2>
<p>Essa parte confunde muita gente, e entender a diferença é fundamental para fazer a escolha certa:</p>

<ul>
  <li><strong>Assinatura (Microsoft 365):</strong> exige renovação periódica (mensal ou anual) para continuar funcionando. Inclui atualizações constantes e armazenamento no OneDrive. Quando o pagamento para, o acesso é bloqueado.</li>
  <li><strong>Licença vitalícia (Office 2021, 2024 ou 365 vitalício):</strong> pagamento único para a versão adquirida, sem mensalidade recorrente. Funciona indefinidamente na versão comprada, sem necessidade de renovação.</li>
  <li><strong>Chave inválida ou irregular:</strong> pode parar de funcionar a qualquer momento. Inclui chaves revendidas ilegalmente, chaves corporativas vazadas e chaves geradas por software pirata. Além de não funcionar de forma confiável, podem trazer riscos de segurança.</li>
</ul>

<p>Na prática, o que mais gera transtorno é comprar uma chave barata demais sem procedência. O usuário acha que economizou, mas depois perde tempo e dinheiro corrigindo o problema. A diferença de preço entre uma chave duvidosa e uma licença legítima muitas vezes não compensa o risco.</p>

<h2>O que não fazer quando o Office expira</h2>
<p>Existem várias "soluções" que circulam na internet, mas que na prática só pioram a situação:</p>

<ul>
  <li><strong>Não usar ativadores ilegais</strong> — programas como KMSpico, Re-Loader e AAct são detectados como malware pela maioria dos antivírus. Além de não oferecerem ativação permanente, podem instalar trojans, keyloggers e outros softwares maliciosos no seu computador.</li>
  <li><strong>Não baixar cracks ou instaladores modificados</strong> — versões "pré-ativadas" do Office frequentemente contêm código malicioso embutido. Você instala achando que está economizando, mas compromete a segurança de todos os seus dados.</li>
  <li><strong>Não comprar licenças sem procedência</strong> — sites que vendem chaves por R$ 5 ou R$ 10 geralmente revendem chaves corporativas vazadas ou chaves de volume que a Microsoft pode revogar a qualquer momento.</li>
  <li><strong>Não ignorar os alertas de produto não licenciado</strong> — quanto mais tempo você usa o Office sem licença, mais funcionalidades são bloqueadas. Em alguns casos, o acesso total é removido e você pode perder trabalho não salvo.</li>
</ul>

<p>Além do risco de malware, essas opções costumam causar exatamente o cenário que você quer evitar: o Office volta a pedir ativação depois de alguns dias ou semanas, criando um ciclo frustrante.</p>

<div class="bg-blue-50 p-4 rounded-xl mt-6 text-center">
  <p class="font-bold text-lg">🚀 Ative em menos de 5 minutos</p>
  <p>Receba a licença e volte a usar Word, Excel e PowerPoint sem espera.</p>
  <a data-cta="office-main-2" href="https://casadosoftware.com.br/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive?utm_source=blog&utm_medium=article&utm_campaign=office-365-expirou-como-ativar" class="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
    COMPRAR LICENÇA AGORA
  </a>
</div>

<h2>Como resolver: passo a passo</h2>
<p>Se o seu Office expirou ou está pedindo ativação, siga este roteiro para resolver de forma definitiva:</p>

<ol>
  <li><strong>Identifique o tipo de problema:</strong> abra qualquer aplicativo do Office (Word, Excel, PowerPoint) e veja a mensagem exata. Anote se diz "Produto Não Licenciado", "Assinatura Expirada" ou outro erro específico.</li>
  <li><strong>Verifique sua conta Microsoft:</strong> vá em Arquivo → Conta e veja se há uma conta vinculada. Se a conta estiver deslogada, tente fazer login novamente.</li>
  <li><strong>Desinstale versões conflitantes:</strong> se você tem mais de uma versão do Office instalada, isso pode causar conflitos de licença. Desinstale as versões que não usa.</li>
  <li><strong>Adquira uma licença válida:</strong> a forma mais segura e rápida de resolver é comprar uma licença original com entrega automática.</li>
  <li><strong>Ative com a nova chave:</strong> siga as instruções de ativação que acompanham a licença. O processo geralmente leva menos de 5 minutos.</li>
  <li><strong>Confirme a ativação:</strong> abra o Word, vá em Arquivo → Conta e verifique se aparece "Produto Ativado".</li>
</ol>

<h2>Melhor solução para quem quer evitar dor de cabeça</h2>
<p>Se o objetivo é resolver rápido e de forma definitiva, a melhor saída é usar uma licença válida, com entrega automática e ativação imediata. Isso evita erros recorrentes, reduz o risco de bloqueio e devolve o funcionamento completo dos aplicativos.</p>

<p>Esse tipo de solução é ideal para quem usa o Office no trabalho, nos estudos ou no dia a dia e não quer depender de métodos instáveis. Com uma licença original, você tem:</p>

<ul>
  <li>Acesso completo a Word, Excel, PowerPoint e outros aplicativos</li>
  <li>Atualizações de segurança garantidas</li>
  <li>Funcionamento em múltiplos dispositivos (PC, Mac, Android, iOS)</li>
  <li>Armazenamento no OneDrive incluído</li>
  <li>Nenhum risco de bloqueio futuro por chave irregular</li>
</ul>

<h2>O que fazer depois da compra</h2>
<ol>
  <li>Receba a licença no e-mail ou na tela após o pagamento</li>
  <li>Siga o passo a passo de ativação enviado junto com a chave</li>
  <li>Abra o Word, Excel ou PowerPoint</li>
  <li>Vá em Arquivo → Conta e confirme que a licença foi reconhecida</li>
  <li>Teste edição e salvamento normalmente para garantir que tudo funciona</li>
</ol>

<p>Todo o processo costuma levar menos de 5 minutos. A entrega é automática, então você não precisa esperar nenhum envio manual.</p>

<h2>Perguntas frequentes</h2>

<h3>1. Como saber se meu Office está sem licença?</h3>
<p>Normalmente aparece um aviso de "Produto Não Licenciado" na barra de título dos aplicativos, pedido de ativação ao abrir qualquer programa, ou bloqueio de funções como editar e salvar. Você também pode verificar em Arquivo → Conta dentro de qualquer aplicativo do Office.</p>

<h3>2. Ativador de Office funciona mesmo?</h3>
<p>Pode até funcionar temporariamente, mas o risco de bloqueio, instabilidade e malware é alto. A Microsoft atualiza constantemente seus mecanismos de detecção, e ativadores ilegais são frequentemente neutralizados por atualizações do Windows. Além disso, muitos ativadores instalam software malicioso junto.</p>

<h3>3. Posso usar em mais de um dispositivo?</h3>
<p>Depende do tipo de licença adquirida. Licenças do Microsoft 365 geralmente permitem uso em até 5 dispositivos simultâneos (PC, Mac, tablets e smartphones). Verifique sempre a descrição do produto antes da compra para confirmar.</p>

<h3>4. A ativação é imediata?</h3>
<p>Quando a licença é entregue automaticamente (como no caso de lojas digitais especializadas), o processo costuma ser muito rápido. Você recebe a chave e as instruções imediatamente após a confirmação do pagamento.</p>

<h3>5. Vale a pena resolver isso agora?</h3>
<p>Sim. Quanto antes corrigir a licença, menor a chance de perder produtividade ou ficar sem acesso aos arquivos. O Office sem licença vai progressivamente bloqueando mais funcionalidades, e em alguns casos pode impedir completamente o acesso aos seus documentos.</p>

<h3>6. Qual a diferença entre Office 365 e Office 2024?</h3>
<p>O Office 365 (Microsoft 365) funciona por assinatura ou licença vitalícia e inclui atualizações contínuas. O Office 2024 é uma versão de compra única com os recursos disponíveis no momento do lançamento. Ambos são opções válidas, mas o 365 tende a receber novidades primeiro.</p>

<h3>7. Perco meus arquivos se o Office expirar?</h3>
<p>Não. Seus arquivos continuam salvos no computador e no OneDrive. O que acontece é que você perde a capacidade de editá-los dentro dos aplicativos do Office. Você ainda pode visualizá-los, mas não poderá fazer alterações até reativar a licença.</p>

<h2>Conclusão</h2>
<p>Se o seu Office 365 expirou, insistir em soluções improvisadas só aumenta o risco de erro, bloqueio e perda de tempo. A forma mais segura e eficiente é ativar com uma licença válida e voltar a usar todos os recursos normalmente.</p>

<p>Não espere o problema piorar. Resolva agora e recupere o acesso completo ao Word, Excel, PowerPoint e todos os aplicativos que você precisa no dia a dia.</p>

<div class="bg-blue-600 text-white p-6 rounded-xl text-center mt-6">
  <p class="font-bold text-xl">🔥 Ative seu Office agora</p>
  <p>Resolva o problema hoje com envio automático e ativação rápida.</p>
  <a data-cta="office-main-3" href="https://casadosoftware.com.br/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive?utm_source=blog&utm_medium=article&utm_campaign=office-365-expirou-como-ativar" class="inline-block mt-4 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold">
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

  // Step 2: Update html + featuredImage
  let updated: any
  try {
    updated = await (prisma as any).blogPost.update({
      where: { id: post.id },
      data: {
        html: CLEAN_HTML,
        featuredImage: FEATURED_IMAGE
      },
      select: {
        id: true,
        slug: true,
        html: true,
        featuredImage: true,
        atualizadoEm: true
      }
    })
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: `update failed: ${err.message}` })
  }

  // Step 2.5: Also update ALL translations to clean HTML + featuredImage
  let translationsUpdated = 0
  try {
    const translations = await (prisma as any).blogPostTranslation.findMany({
      where: { postId: post.id },
      select: { id: true, lang: true, html: true }
    })
    for (const tr of translations) {
      if (tr.html && (tr.html.includes('<template') || tr.html.includes('<h1') || tr.html.includes('SEU_LINK_AQUI') || tr.html.includes('min-h-screen'))) {
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

  // Step 3: Read-after-write verification
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
    allCtasPointToProduct: (savedHtml.match(/data-cta=/g) || []).length === (savedHtml.match(/href="https:\/\/casadosoftware\.com\.br\/produto\//g) || []).length,
    featuredImageFixed: savedImage === FEATURED_IMAGE,
    htmlLength: savedHtml.length,
    htmlPreview: savedHtml.substring(0, 300),
    htmlEnd: savedHtml.substring(savedHtml.length - 200)
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
    message: allGood
      ? 'Post atualizado e verificado com sucesso'
      : 'ATENÇÃO: algum check falhou, verifique os detalhes'
  }
})
