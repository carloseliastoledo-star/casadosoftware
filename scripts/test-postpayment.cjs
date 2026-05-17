'use strict'
const fs = require('fs')
const path = require('path')

let passed = 0
let failed = 0

function ok(label, msg) { passed++; console.log(`✅ [${label}] ${msg}`) }
function fail(label, msg) { failed++; console.log(`❌ [${label}] ${msg}`) }

function read(rel) {
  const abs = path.join('c:\\Users\\User\\minhakeys', rel)
  return fs.existsSync(abs) ? fs.readFileSync(abs, 'utf-8') : null
}

// ──────────────────────────────────────────────────────────────
// 1. mailer.ts
// ──────────────────────────────────────────────────────────────
console.log('\n━━━ 1. mailer.ts ━━━\n')
const mailer = read('server/utils/mailer.ts')

if (mailer.includes("storeSlug?: string")) {
  ok('mailer', 'renderLicenseEmail aceita storeSlug? opcional')
} else {
  fail('mailer', 'storeSlug? ausente na assinatura')
}
if (mailer.includes("storeSlug === 'international'")) {
  ok('mailer', "branch condicional storeSlug === 'international' presente")
} else {
  fail('mailer', "branch internacional ausente")
}
if (mailer.includes('GlobalSoftware Store') && mailer.includes('lang="en"')) {
  ok('mailer', 'template internacional: GlobalSoftware Store + lang=en')
} else {
  fail('mailer', 'template internacional incompleto')
}
if (mailer.includes('Your license is here!') && mailer.includes('Payment confirmed')) {
  ok('mailer', 'corpo inglês: "Your license is here!" + "Payment confirmed"')
} else {
  fail('mailer', 'textos ingleses ausentes no template internacional')
}
if (mailer.includes('Product') && mailer.includes('Order') && mailer.includes('Your License')) {
  ok('mailer', 'labels ingleses: Product / Order / Your License')
} else {
  fail('mailer', 'labels ingleses ausentes')
}
if (!mailer.includes('WhatsApp')) {
  // WhatsApp só existe no bloco PT — verifica que não aparece no bloco EN
  const intlBlock = mailer.split("storeSlug === 'international'")[1]?.split('// ── Casa do Software')[0] || ''
  if (!intlBlock.includes('WhatsApp')) {
    ok('mailer', 'WhatsApp não aparece no template internacional')
  } else {
    fail('mailer', 'WhatsApp aparece no template internacional')
  }
} else {
  // WhatsApp existe — deve ser apenas no bloco PT
  const ptBlock = mailer.split('// ── Casa do Software')[1] || ''
  if (ptBlock.includes('WhatsApp')) {
    ok('mailer', 'WhatsApp apenas no bloco Casa do Software (correto)')
  } else {
    fail('mailer', 'WhatsApp no lugar errado')
  }
}
if (mailer.includes('INTL_SITE_URL') && mailer.includes('globalsoftware.store')) {
  ok('mailer', 'siteUrl internacional usa INTL_SITE_URL com fallback globalsoftware.store')
} else {
  fail('mailer', 'INTL_SITE_URL ausente')
}
// Garantir bloco Casa do Software intacto
const ptSection = mailer.split('// ── Casa do Software')[1] || ''
if (ptSection.includes('Casa do Software') && ptSection.includes('lang="pt-BR"') && ptSection.includes('Sua licença chegou!')) {
  ok('mailer', 'template Casa do Software INTACTO (PT, "Sua licença chegou!")')
} else {
  fail('mailer', 'template Casa do Software foi alterado')
}

// ──────────────────────────────────────────────────────────────
// 2. orderFulfillment.ts
// ──────────────────────────────────────────────────────────────
console.log('\n━━━ 2. orderFulfillment.ts ━━━\n')
const fulfillment = read('server/utils/orderFulfillment.ts')

if (fulfillment.includes('storeSlug: order.storeSlug')) {
  ok('fulfillment', 'order.storeSlug passado para renderLicenseEmail')
} else {
  fail('fulfillment', 'storeSlug não passado para renderLicenseEmail')
}
if (fulfillment.includes("isIntl") && fulfillment.includes("'international'")) {
  ok('fulfillment', 'isIntl calculado corretamente')
} else {
  fail('fulfillment', 'isIntl ausente')
}
if (fulfillment.includes('Your software license:') && fulfillment.includes('Sua licença:')) {
  ok('fulfillment', 'subject condicional: inglês para international, PT para nacional')
} else {
  fail('fulfillment', 'subject condicional ausente ou incompleto')
}

// ──────────────────────────────────────────────────────────────
// 3. markOrderAsPaid.ts
// ──────────────────────────────────────────────────────────────
console.log('\n━━━ 3. markOrderAsPaid.ts ━━━\n')
const markPaid = read('server/services/markOrderAsPaid.ts')

if (markPaid.includes('storeSlug: string | null')) {
  ok('markPaid', 'tipo EmailPayload inclui storeSlug: string | null')
} else {
  fail('markPaid', 'storeSlug ausente no tipo EmailPayload')
}
if (markPaid.includes('storeSlug: order.storeSlug ?? null')) {
  ok('markPaid', 'emailPayload inclui order.storeSlug')
} else {
  fail('markPaid', 'emailPayload não inclui storeSlug')
}
if (markPaid.includes("ep.storeSlug || undefined") && markPaid.includes('isIntl')) {
  ok('markPaid', 'ep.storeSlug passado para renderLicenseEmail com isIntl')
} else {
  fail('markPaid', 'isIntl ou ep.storeSlug ausentes no bloco de envio')
}
if (markPaid.includes('Your software license:') && markPaid.includes('Sua licença:')) {
  ok('markPaid', 'subject condicional EN/PT presente')
} else {
  fail('markPaid', 'subject condicional ausente')
}
if (markPaid.includes("currency: true")) {
  ok('markPaid', 'currency incluído no SELECT do order.update')
} else {
  fail('markPaid', 'currency ausente no SELECT')
}

// ──────────────────────────────────────────────────────────────
// 4. obrigado.vue
// ──────────────────────────────────────────────────────────────
console.log('\n━━━ 4. obrigado.vue ━━━\n')
const obrigado = read('app/pages/obrigado.vue')

// Sem duplicata de config
const configMatches = (obrigado.match(/const config = useRuntimeConfig\(\)/g) || []).length
if (configMatches === 1) {
  ok('obrigado', 'const config declarado 1x (sem duplicata)')
} else {
  fail('obrigado', `const config declarado ${configMatches}x (duplicata!)`)
}

if (obrigado.includes('isInternational') && obrigado.includes("storeSlug || ''")) {
  ok('obrigado', 'isInternational computed presente e lê storeSlug')
} else {
  fail('obrigado', 'isInternational computed ausente ou sem storeSlug')
}
if (obrigado.includes('v-if="isInternational"')) {
  ok('obrigado', 'template internacional: v-if="isInternational"')
} else {
  fail('obrigado', 'v-if="isInternational" ausente no template')
}
if (obrigado.includes('v-else') && obrigado.includes('Obrigado pela sua compra!')) {
  ok('obrigado', 'template nacional mantido no v-else')
} else {
  fail('obrigado', 'template nacional ausente no v-else')
}

// Textos ingleses
if (obrigado.includes('Thank you for your purchase!') && obrigado.includes('Payment confirmed') && obrigado.includes('Back to Home')) {
  ok('obrigado', 'textos ingleses presentes: "Thank you", "Payment confirmed", "Back to Home"')
} else {
  fail('obrigado', 'textos ingleses ausentes')
}
if (obrigado.includes('Your license and order details will be sent to your email')) {
  ok('obrigado', 'instrução de e-mail em inglês')
} else {
  fail('obrigado', 'instrução de e-mail em inglês ausente')
}
if (obrigado.includes('Order:</span>') && obrigado.includes('Payment:</span>')) {
  ok('obrigado', 'labels Order/Payment em inglês presentes')
} else {
  fail('obrigado', 'labels Order/Payment em inglês ausentes')
}

// Sem PIX/MercadoPago no bloco internacional
const intlSection = obrigado.split('v-if="isInternational"')[1]?.split('v-else')[0] || ''
const ptLeaks = ['PIX', 'Mercado Pago', 'Boleto', 'R$', 'COMPRAR AGORA'].filter(w => intlSection.includes(w))
if (ptLeaks.length === 0) {
  ok('obrigado', 'bloco internacional sem PIX/MercadoPago/R$/PT')
} else {
  fail('obrigado', `leak no bloco internacional: ${ptLeaks.join(', ')}`)
}

// Bloco nacional intacto
const nacionalSection = obrigado.split('v-else')[1] || ''
if (nacionalSection.includes('Obrigado pela sua compra!') && nacionalSection.includes('Pagamento confirmado') && nacionalSection.includes('Ver produtos')) {
  ok('obrigado', 'bloco Casa do Software INTACTO no v-else')
} else {
  fail('obrigado', 'bloco Casa do Software alterado ou ausente no v-else')
}

// Tracking: funnel BRL bloqueado para international
if (obrigado.includes('if (isInternational.value) return')) {
  ok('obrigado', 'fireFunnelPurchaseTracking(): retorno antecipado para international (sem BRL)')
} else {
  fail('obrigado', 'fireFunnelPurchaseTracking(): não bloqueia BRL para international')
}

// Tracking: currency dinâmica
if (obrigado.includes("orderCurrencyUpper === 'EUR' ? 'EUR'")) {
  ok('obrigado', 'GA4 tracking: currency dinâmica USD/EUR/BRL (não hardcoded BRL)')
} else {
  fail('obrigado', 'GA4 tracking: currency ainda hardcoded BRL')
}

// ──────────────────────────────────────────────────────────────
// 5. Exemplo do e-mail internacional renderizado
// ──────────────────────────────────────────────────────────────
console.log('\n━━━ 5. Exemplo renderizado: e-mail internacional ━━━\n')

// Simula o renderLicenseEmail com storeSlug='international'
// (sem importar TS — apenas verifica os strings que estariam no output)
const expectedIntlStrings = [
  'GlobalSoftware Store',
  'lang="en"',
  'Your license is here!',
  'Payment confirmed. Here are your license details',
  'Product',
  'Order',
  'Your License',
  'Keep this email in a safe place',
  'Contact our support team',
  'globalsoftware.store'
]
const forbiddenIntlStrings = [
  'Casa do Software',
  'pt-BR',
  'Sua licença chegou',
  'Pagamento confirmado',
  'Produto',
  'Pedido',
  'WhatsApp',
  'casadosoftware.com.br'
]

// Extrai o bloco do template internacional do mailer.ts
const intlEmailBlock = mailer.split("storeSlug === 'international'")[1]?.split('// ── Casa do Software')[0] || ''
const missingIntl = expectedIntlStrings.filter(s => !intlEmailBlock.includes(s))
const leakedIntl = forbiddenIntlStrings.filter(s => intlEmailBlock.includes(s))

if (missingIntl.length === 0) {
  ok('emailIntl', 'todos os strings ingleses presentes no template internacional')
} else {
  fail('emailIntl', `strings ausentes: ${missingIntl.join(', ')}`)
}
if (leakedIntl.length === 0) {
  ok('emailIntl', 'nenhum string PT/Casa do Software no template internacional')
} else {
  fail('emailIntl', `strings proibidos presentes: ${leakedIntl.join(', ')}`)
}

// ──────────────────────────────────────────────────────────────
// 6. Exemplo e-mail Casa do Software (intacto)
// ──────────────────────────────────────────────────────────────
console.log('\n━━━ 6. Exemplo renderizado: e-mail Casa do Software ━━━\n')

const ptEmailBlock = mailer.split('// ── Casa do Software')[1] || ''
const expectedPtStrings = ['Casa do Software', 'lang="pt-BR"', 'Sua licença chegou!', 'Pagamento confirmado', 'Produto', 'Pedido', 'Sua Licença', 'WhatsApp', 'casadosoftware.com.br']
const missingPt = expectedPtStrings.filter(s => !ptEmailBlock.includes(s))

if (missingPt.length === 0) {
  ok('emailPT', 'template Casa do Software INTACTO: todos os strings PT presentes')
} else {
  fail('emailPT', `strings PT ausentes: ${missingPt.join(', ')}`)
}

// ──────────────────────────────────────────────────────────────
// RESUMO
// ──────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════')
console.log(`RESUMO: ${passed} ✅  |  ${failed} ❌`)
console.log('════════════════════════════════════════\n')
process.exit(failed > 0 ? 1 : 0)
