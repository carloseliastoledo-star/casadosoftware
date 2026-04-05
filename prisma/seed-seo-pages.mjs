/**
 * Seed opcional: 5 SEO Pages de exemplo (EN + PT)
 * Executar com:  node prisma/seed-seo-pages.mjs
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const pages = [
  // ── EN ────────────────────────────────────────────────────────────────────
  {
    locale: 'en',
    slug: 'buy-office-365',
    title: 'Buy Office 365 EN',
    seoTitle: 'Buy Office 365 — Original Key | Best Price 2025',
    seoDescription: 'Buy a genuine Microsoft Office 365 license at the best price. Instant delivery by email, lifetime activation, 24/7 support.',
    h1: 'Buy Office 365 — Original License at the Best Price',
    heroBadge: 'Cheapest Price 2025',
    heroDescription: 'Genuine Microsoft Office 365 key. Instant email delivery. Works on Windows and Mac.',
    contentHtml: `<h2>Why buy Office 365 from Casa do Software?</h2>
<p>We sell 100% original Microsoft licenses at prices up to 80% cheaper than retail. Every license is verified before delivery.</p>
<ul>
  <li>✅ 100% genuine Microsoft license</li>
  <li>⚡ Delivery in minutes by email</li>
  <li>🛡️ Lifetime activation — no subscription required</li>
  <li>💬 Step-by-step activation support</li>
</ul>
<h2>How to activate Office 365</h2>
<p>After purchasing, you will receive your product key by email. Simply visit office.com/setup, sign in or create a Microsoft account, and enter the key to activate.</p>`,
    faqJson: JSON.stringify([
      { q: 'Is this a genuine Office 365 license?', a: 'Yes. Every key we sell is 100% original Microsoft software.' },
      { q: 'How long does delivery take?', a: 'Delivery is instant — you receive your key by email within minutes of payment.' },
      { q: 'Does it work on Mac?', a: 'Yes. Office 365 is compatible with Windows 10, Windows 11, and macOS.' },
      { q: 'Can I use it on multiple devices?', a: 'It depends on the license type. Single-device licenses activate on one PC or Mac.' }
    ]),
    linkedProductSlug: 'microsoft-office-365',
    templateKey: 'default-money-page',
    status: 'published',
    publishedAt: new Date()
  },
  {
    locale: 'en',
    slug: 'cheap-windows-11-key',
    title: 'Cheap Windows 11 Key EN',
    seoTitle: 'Cheap Windows 11 Key — Genuine License | Casa do Software',
    seoDescription: 'Buy a genuine Windows 11 activation key at the lowest price. Instant digital delivery, lifetime activation, original Microsoft license.',
    h1: 'Cheap Windows 11 Key — Original Microsoft License',
    heroBadge: 'Best Deal 2025',
    heroDescription: 'Activate Windows 11 with a genuine Microsoft key. Instant email delivery. Up to 80% off retail price.',
    contentHtml: `<h2>Genuine Windows 11 License at the Lowest Price</h2>
<p>Get a 100% original Windows 11 activation key for a fraction of the retail price. Our licenses are verified and guaranteed to work.</p>
<h2>System Requirements</h2>
<ul>
  <li>Processor: 1 GHz or faster with 2 or more cores</li>
  <li>RAM: 4 GB minimum</li>
  <li>Storage: 64 GB minimum</li>
  <li>TPM version 2.0 required</li>
</ul>`,
    faqJson: JSON.stringify([
      { q: 'Is this Windows 11 Home or Pro?', a: 'We offer both versions. Select the one you need before purchasing.' },
      { q: 'Does my PC support Windows 11?', a: 'Use the Microsoft PC Health Check app to verify compatibility before buying.' },
      { q: 'What if the key does not work?', a: 'We offer a full replacement or refund if your key has any issues.' }
    ]),
    linkedProductSlug: 'windows-11-pro',
    templateKey: 'default-money-page',
    status: 'published',
    publishedAt: new Date()
  },
  {
    locale: 'en',
    slug: 'office-activation-key',
    title: 'Office Activation Key EN',
    seoTitle: 'Microsoft Office Activation Key — Buy Online | Casa do Software',
    seoDescription: 'Get your Microsoft Office activation key online. Original license, instant delivery, works on Word, Excel, PowerPoint and more.',
    h1: 'Microsoft Office Activation Key — Instant Online Delivery',
    heroBadge: 'Instant Delivery',
    heroDescription: 'Activate Microsoft Office Word, Excel and PowerPoint with an original key. Delivered by email in minutes.',
    contentHtml: `<h2>What is included in your Microsoft Office activation key</h2>
<p>Your purchase includes a product key that activates the full Microsoft Office suite, including Word, Excel, PowerPoint, Outlook, and more.</p>`,
    faqJson: JSON.stringify([
      { q: 'Which Office apps are included?', a: 'Depending on the version you choose, you may get Word, Excel, PowerPoint, Outlook, OneNote, and more.' },
      { q: 'Is this a one-time purchase?', a: 'Yes. Unlike Office 365 subscriptions, a retail key is a one-time purchase with lifetime use.' }
    ]),
    linkedProductSlug: 'microsoft-office-2021',
    templateKey: 'default-money-page',
    status: 'published',
    publishedAt: new Date()
  },

  // ── PT ────────────────────────────────────────────────────────────────────
  {
    locale: 'pt',
    slug: 'comprar-office-365',
    title: 'Comprar Office 365 PT',
    seoTitle: 'Comprar Office 365 — Licença Original | Melhor Preço 2025',
    seoDescription: 'Compre Office 365 com licença genuína Microsoft. Entrega imediata por e-mail, ativação vitalícia, preço até 80% mais barato.',
    h1: 'Comprar Office 365 — Licença Original Microsoft',
    heroBadge: 'Menor Preço 2025',
    heroDescription: 'Licença Microsoft Office 365 genuína. Entrega imediata por e-mail. Funciona no Windows e no Mac.',
    contentHtml: `<h2>Por que comprar Office 365 na Casa do Software?</h2>
<p>Vendemos licenças 100% originais Microsoft com preços até 80% mais baratos do que o varejo. Cada licença é verificada antes da entrega.</p>
<ul>
  <li>✅ Licença genuína Microsoft 100%</li>
  <li>⚡ Entrega em minutos por e-mail</li>
  <li>🛡️ Ativação vitalícia — sem mensalidades</li>
  <li>💬 Suporte de ativação passo a passo</li>
</ul>`,
    faqJson: JSON.stringify([
      { q: 'É uma licença original do Office 365?', a: 'Sim. Todas as chaves vendidas são 100% originais Microsoft.' },
      { q: 'Quanto tempo leva a entrega?', a: 'A entrega é imediata — você recebe a chave por e-mail em minutos após o pagamento.' },
      { q: 'Funciona no Mac?', a: 'Sim. O Office 365 é compatível com Windows 10, Windows 11 e macOS.' }
    ]),
    linkedProductSlug: 'microsoft-office-365',
    templateKey: 'default-money-page',
    status: 'published',
    publishedAt: new Date()
  },
  {
    locale: 'pt',
    slug: 'ativar-office-365',
    title: 'Ativar Office 365 PT',
    seoTitle: 'Como Ativar Office 365 — Guia Completo + Chave Original',
    seoDescription: 'Saiba como ativar o Office 365 passo a passo e compre sua chave de ativação original com entrega imediata e menor preço garantido.',
    h1: 'Como Ativar o Office 365 — Guia Completo + Melhor Preço',
    heroBadge: 'Guia + Chave Original',
    heroDescription: 'Tutorial completo de ativação do Office 365 e chave genuína com entrega imediata por e-mail.',
    contentHtml: `<h2>Passo a passo: como ativar o Office 365</h2>
<ol>
  <li>Compre sua chave de produto na Casa do Software.</li>
  <li>Acesse <strong>office.com/setup</strong> no seu navegador.</li>
  <li>Entre com sua conta Microsoft (ou crie uma gratuitamente).</li>
  <li>Insira a chave de 25 dígitos que você recebeu por e-mail.</li>
  <li>Clique em "Resgatar" e depois em "Instalar o Office".</li>
  <li>Baixe e instale o aplicativo. Pronto!</li>
</ol>
<h2>Problemas na ativação?</h2>
<p>Nosso suporte está disponível 24h por dia, 7 dias por semana para ajudar você a ativar sua licença sem dificuldades.</p>`,
    faqJson: JSON.stringify([
      { q: 'Posso usar a chave em mais de um computador?', a: 'Depende do tipo de licença. Licenças retail ativam em 1 dispositivo por vez.' },
      { q: 'O que acontece se a chave não funcionar?', a: 'Oferecemos substituição imediata ou reembolso caso haja qualquer problema com a chave.' },
      { q: 'Preciso de internet para ativar?', a: 'Sim, a ativação online requer conexão com a internet para verificar a chave no servidor Microsoft.' }
    ]),
    linkedProductSlug: 'microsoft-office-365',
    templateKey: 'default-money-page',
    status: 'published',
    publishedAt: new Date()
  }
]

async function main() {
  console.log('Inserindo SEO Pages de exemplo...')

  for (const page of pages) {
    await prisma.seoPage.upsert({
      where: { locale_slug: { locale: page.locale, slug: page.slug } },
      update: page,
      create: page
    })
    console.log(`  ✅ [${page.locale}] /lp/${page.slug}`)
  }

  console.log(`\n✅ ${pages.length} SEO Pages inseridas com sucesso.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
