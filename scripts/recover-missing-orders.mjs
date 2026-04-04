import mysql from 'mysql2/promise'

const DO_URL = process.env.DO_URL
const RL_URL = process.env.DATABASE_URL

const doUrl = new URL(DO_URL)
const rlUrl = new URL(RL_URL)

const do_ = await mysql.createConnection({
  host: doUrl.hostname, port: parseInt(doUrl.port),
  user: doUrl.username, password: decodeURIComponent(doUrl.password),
  database: doUrl.pathname.slice(1), ssl: { rejectUnauthorized: false },
  charset: 'utf8mb4', connectTimeout: 15000,
})

const rl = await mysql.createConnection({
  host: rlUrl.hostname, port: parseInt(rlUrl.port),
  user: rlUrl.username, password: decodeURIComponent(rlUrl.password),
  database: rlUrl.pathname.slice(1), charset: 'utf8mb4',
})

// 1. Get order IDs already in Railway
const [rlOrders] = await rl.query('SELECT id FROM `Order`')
const rlOrderIds = new Set(rlOrders.map(r => r.id))
console.log(`Railway: ${rlOrderIds.size} orders`)

// 2. Get all orders from DO
const [doOrders] = await do_.query('SELECT * FROM `Order`')
console.log(`DigitalOcean: ${doOrders.length} orders`)

const missing = doOrders.filter(o => !rlOrderIds.has(o.id))
console.log(`Missing in Railway: ${missing.length} orders\n`)

if (missing.length === 0) {
  console.log('Nothing to migrate.')
  await do_.end(); await rl.end(); process.exit(0)
}

// 3. Get Railway customer map (email+storeSlug → id) and produto map (id set)
const [rlCustomers] = await rl.query('SELECT id, email, storeSlug FROM Customer')
const rlCustMap = new Map(rlCustomers.map(c => [`${c.email}|${c.storeSlug ?? ''}`, c.id]))
const rlCustIds = new Set(rlCustomers.map(c => c.id))

const [rlProdutos] = await rl.query('SELECT id FROM Produto')
const rlProdutoIds = new Set(rlProdutos.map(p => p.id))

// 4. Get DO customers for missing orders
const missingCustomerIds = [...new Set(missing.map(o => o.customerId))]
const [doCustomers] = await do_.query(
  `SELECT * FROM Customer WHERE id IN (${missingCustomerIds.map(() => '?').join(',')})`,
  missingCustomerIds
)
const doCustomerMap = new Map(doCustomers.map(c => [c.id, c]))

let custCreated = 0, ordersImported = 0, licencasImported = 0, skipped = 0

for (const order of missing) {
  // Check if produto exists in Railway
  if (!rlProdutoIds.has(order.produtoId)) {
    console.log(`  [SKIP] Order ${order.numero} — produtoId ${order.produtoId} not in Railway`)
    skipped++
    continue
  }

  // Ensure customer exists in Railway
  let customerId = order.customerId
  if (!rlCustIds.has(customerId)) {
    const doCustomer = doCustomerMap.get(customerId)
    if (!doCustomer) {
      console.log(`  [SKIP] Order ${order.numero} — customer ${customerId} not found in DO`)
      skipped++
      continue
    }
    const key = `${doCustomer.email}|${doCustomer.storeSlug ?? ''}`
    if (rlCustMap.has(key)) {
      // Customer exists by email — reuse Railway ID
      customerId = rlCustMap.get(key)
    } else {
      // Insert customer into Railway
      await rl.execute(
        `INSERT IGNORE INTO Customer (id, email, storeSlug, passwordHash, passwordResetTokenHash, passwordResetExpiresAt, nome, whatsapp, wcCustomerId, cpf, criadoEm)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [doCustomer.id, doCustomer.email, doCustomer.storeSlug, doCustomer.passwordHash,
         doCustomer.passwordResetTokenHash, doCustomer.passwordResetExpiresAt,
         doCustomer.nome, doCustomer.whatsapp, doCustomer.wcCustomerId, doCustomer.cpf, doCustomer.criadoEm]
      )
      rlCustMap.set(key, doCustomer.id)
      rlCustIds.add(doCustomer.id)
      custCreated++
    }
  }

  // Insert order
  await rl.execute(
    `INSERT IGNORE INTO \`Order\` (id, numero, status, storeSlug, affiliateId, trafficSourceType,
      utmSource, utmMedium, utmCampaign, utmTerm, utmContent, gclid, fbclid, referrer, landingPage,
      currency, countryCode, produtoId, customerId, cupomId, subtotalAmount, pixDiscountPercent,
      pixDiscountAmount, couponCode, couponPercent, couponDiscountAmount, totalAmount,
      mercadoPagoPaymentId, mercadoPagoPaymentTypeId, mercadoPagoPaymentMethodId,
      stripePaymentIntentId, pagarmeChargeId, pagbankChargeId,
      orderBump, bumpProductId, parentOrderId,
      criadoEm, pagoEm, emailEnviadoEm, telegramEnviadoEm,
      fulfillmentStatus, fulfillmentError, fulfillmentUpdatedAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [order.id, order.numero, order.status, order.storeSlug, order.affiliateId,
     order.trafficSourceType, order.utmSource, order.utmMedium, order.utmCampaign,
     order.utmTerm, order.utmContent, order.gclid, order.fbclid, order.referrer,
     order.landingPage, order.currency, order.countryCode, order.produtoId, customerId,
     order.cupomId, order.subtotalAmount, order.pixDiscountPercent, order.pixDiscountAmount,
     order.couponCode, order.couponPercent, order.couponDiscountAmount, order.totalAmount,
     order.mercadoPagoPaymentId, order.mercadoPagoPaymentTypeId, order.mercadoPagoPaymentMethodId,
     order.stripePaymentIntentId, order.pagarmeChargeId, order.pagbankChargeId,
     order.orderBump ?? 0, order.bumpProductId, order.parentOrderId,
     order.criadoEm, order.pagoEm, order.emailEnviadoEm, order.telegramEnviadoEm,
     order.fulfillmentStatus, order.fulfillmentError, order.fulfillmentUpdatedAt]
  )
  console.log(`  [OK] Order #${order.numero} (${order.status}) ${order.criadoEm?.toISOString?.()?.slice(0,10) ?? ''}`)
  ordersImported++

  // Migrate licencas for this order
  const [doLicencas] = await do_.query('SELECT * FROM Licenca WHERE orderId = ?', [order.id])
  for (const lic of doLicencas) {
    if (!rlProdutoIds.has(lic.produtoId)) continue
    await rl.execute(
      `INSERT IGNORE INTO Licenca (id, chave, status, produtoId, storeSlug, customerId, orderId, criadoEm)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [lic.id, lic.chave, lic.status, lic.produtoId, lic.storeSlug,
       lic.customerId, lic.orderId, lic.criadoEm]
    )
    licencasImported++
  }
}

console.log(`\n✓ Done.`)
console.log(`  Customers created: ${custCreated}`)
console.log(`  Orders imported:   ${ordersImported}`)
console.log(`  Licencas imported: ${licencasImported}`)
console.log(`  Skipped:           ${skipped}`)

await do_.end()
await rl.end()
