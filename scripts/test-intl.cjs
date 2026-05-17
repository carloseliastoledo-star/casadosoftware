/**
 * test-intl.cjs — Testes automatizados loja internacional
 * node scripts/test-intl.cjs
 * Apenas leitura / GET requests. Nenhum POST real ao Stripe.
 */
'use strict'

const BASE = 'http://localhost:3000'

let passed = 0
let failed = 0
const results = []

function log(icon, label, detail = '') {
  const line = `${icon} ${label}${detail ? ' — ' + detail : ''}`
  console.log(line)
  results.push(line)
}

async function get(path) {
  const res = await fetch(BASE + path, {
    headers: { 'x-store-slug': 'international', 'Accept': 'application/json' }
  })
  return { status: res.status, body: await res.json().catch(() => null) }
}

async function test(name, fn) {
  try {
    await fn()
    passed++
    log('✅', name)
  } catch (e) {
    failed++
    log('❌', name, e.message)
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg)
}

async function run() {
  console.log('\n================================================')
  console.log('TESTES — LOJA INTERNACIONAL (STORE_SLUG=international)')
  console.log('BASE:', BASE)
  console.log('================================================\n')

  // -------------------------------------------------------
  // BLOCO 1: API de produtos — os 5 produtos internacionais
  // -------------------------------------------------------
  console.log('--- BLOCO 1: Produtos com preço internacional ---\n')

  const intlSlugs = [
    { slug: 'office-2021-pro-plus',                                          usd: 29.90, eur: 27.90 },
    { slug: 'office-ltsc-pro-plus-2024',                                     usd: 39.90, eur: 36.90 },
    { slug: 'microsoft-windows-11-pro-chave-esd-32-64-bits',                 usd: 24.90, eur: 22.90 },
    { slug: 'office-2021-pro-plus-windows-11-pro',                           usd: 49.90, eur: 45.90 },
    { slug: 'microsoft-windows-server-2022-standard-download-nota-fiscal',   usd: 69.90, eur: 64.90 },
  ]

  for (const prod of intlSlugs) {
    await test(`Produto ${prod.slug} — API retorna 200`, async () => {
      const { status, body } = await get(`/api/products/${prod.slug}`)
      assert(status === 200, `status ${status}`)
      assert(body?.id || body?.product?.id, 'sem id no body')
    })

    await test(`Produto ${prod.slug} — tem precosMoeda`, async () => {
      const { body } = await get(`/api/products/${prod.slug}`)
      const p = body?.product || body
      const moeda = p?.precosMoeda || []
      assert(Array.isArray(moeda) && moeda.length > 0, `precosMoeda vazio ou ausente (${JSON.stringify(moeda)})`)
    })

    await test(`Produto ${prod.slug} — preço USD ${prod.usd} correto`, async () => {
      const { body } = await get(`/api/products/${prod.slug}`)
      const p = body?.product || body
      const moeda = p?.precosMoeda || []
      const usd = moeda.find(x => x.currency === 'usd' && x.storeSlug === 'international')
      assert(usd, `sem entrada USD/international em precosMoeda: ${JSON.stringify(moeda)}`)
      assert(Math.abs(Number(usd.amount) - prod.usd) < 0.01, `USD amount ${usd.amount} !== ${prod.usd}`)
    })

    await test(`Produto ${prod.slug} — preço EUR ${prod.eur} correto`, async () => {
      const { body } = await get(`/api/products/${prod.slug}`)
      const p = body?.product || body
      const moeda = p?.precosMoeda || []
      const eur = moeda.find(x => x.currency === 'eur' && x.storeSlug === 'international')
      assert(eur, `sem entrada EUR/international em precosMoeda: ${JSON.stringify(moeda)}`)
      assert(Math.abs(Number(eur.amount) - prod.eur) < 0.01, `EUR amount ${eur.amount} !== ${prod.eur}`)
    })
  }

  // -------------------------------------------------------
  // BLOCO 2: Produto SEM preço internacional
  // -------------------------------------------------------
  console.log('\n--- BLOCO 2: Produto sem preço internacional ---\n')

  await test('gta5 — API retorna produto (existe)', async () => {
    const { status } = await get('/api/products/gta5')
    assert(status === 200, `status ${status}`)
  })

  await test('gta5 — NÃO tem precosMoeda international', async () => {
    const { body } = await get('/api/products/gta5')
    const p = body?.product || body
    const moeda = (p?.precosMoeda || []).filter(x => x.storeSlug === 'international')
    assert(moeda.length === 0, `encontrou preço international: ${JSON.stringify(moeda)}`)
  })

  // -------------------------------------------------------
  // BLOCO 3: API /api/intl/payment-intent — validações de erro sem criar pedido
  // -------------------------------------------------------
  console.log('\n--- BLOCO 3: Endpoint /api/intl/payment-intent — validações ---\n')

  await test('payment-intent — rejeita produtoId vazio (400)', async () => {
    const res = await fetch(`${BASE}/api/intl/payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-store-slug': 'international' },
      body: JSON.stringify({ produtoId: '', email: 'test@test.com', currency: 'usd' })
    })
    assert(res.status === 400, `esperava 400, recebeu ${res.status}`)
  })

  await test('payment-intent — rejeita email inválido (400)', async () => {
    const res = await fetch(`${BASE}/api/intl/payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-store-slug': 'international' },
      body: JSON.stringify({ produtoId: '21416b89-1ed4-4729-8c62-abb710381037', email: 'invalido', currency: 'usd' })
    })
    assert(res.status === 400, `esperava 400, recebeu ${res.status}`)
  })

  await test('payment-intent — rejeita currency BRL (400)', async () => {
    const res = await fetch(`${BASE}/api/intl/payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-store-slug': 'international' },
      body: JSON.stringify({ produtoId: '21416b89-1ed4-4729-8c62-abb710381037', email: 'test@test.com', currency: 'brl' })
    })
    assert(res.status === 400, `esperava 400, recebeu ${res.status}`)
  })

  await test('payment-intent — rejeita produto sem preço international (400)', async () => {
    // gta5 não tem preço international
    const gtaId = 'b81e220d-e038-4363-a0e2-f798544bfb64'
    const res = await fetch(`${BASE}/api/intl/payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-store-slug': 'international' },
      body: JSON.stringify({ produtoId: gtaId, email: 'test@test.com', currency: 'usd' })
    })
    const body = await res.json().catch(() => ({}))
    assert(res.status === 400, `esperava 400, recebeu ${res.status} — body: ${JSON.stringify(body)}`)
  })

  // -------------------------------------------------------
  // BLOCO 4: API settings — confirma que international não pega config casa do software
  // -------------------------------------------------------
  console.log('\n--- BLOCO 4: Settings / storeSlug isolation ---\n')

  await test('API /api/public/settings retorna sem erro', async () => {
    const res = await fetch(`${BASE}/api/public/settings`, {
      headers: { 'x-store-slug': 'international' }
    })
    assert(res.status === 200 || res.status === 404, `status inesperado ${res.status}`)
  })

  // -------------------------------------------------------
  // BLOCO 5: Produto inexistente retorna 404
  // -------------------------------------------------------
  console.log('\n--- BLOCO 5: 404 para produto inexistente ---\n')

  await test('Produto inexistente retorna 404', async () => {
    const { status } = await get('/api/products/produto-que-nao-existe-xyz')
    assert(status === 404, `esperava 404, recebeu ${status}`)
  })

  // -------------------------------------------------------
  // RESUMO
  // -------------------------------------------------------
  console.log('\n================================================')
  console.log(`RESUMO: ${passed} passou, ${failed} falhou`)
  console.log('================================================\n')

  if (failed > 0) {
    console.log('FALHAS:')
    results.filter(r => r.startsWith('❌')).forEach(r => console.log(' ', r))
  }

  process.exit(failed > 0 ? 1 : 0)
}

run().catch(e => { console.error('ERRO FATAL:', e.message); process.exit(1) })
