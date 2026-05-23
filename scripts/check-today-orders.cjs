const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTodayOrders() {
  console.log('=== VERIFICANDO PEDIDOS DE HOJE ===\n')
  console.log('Data atual:', new Date().toISOString())
  console.log('DATABASE_URL configurada:', !!process.env.DATABASE_URL)
  console.log('STORE_SLUG:', process.env.STORE_SLUG || '(não configurado)')
  console.log()

  // Pedidos de hoje
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  console.log('Buscando pedidos criados a partir de:', today.toISOString())
  
  const orders = await prisma.order.findMany({
    where: {
      criadoEm: { gte: today }
    },
    include: {
      Customer: { select: { id: true, email: true, nome: true } },
      Produto: { select: { id: true, nome: true, slug: true } }
    },
    orderBy: { criadoEm: 'desc' }
  })

  console.log(`\nTotal de pedidos hoje: ${orders.length}`)
  console.log()

  if (orders.length === 0) {
    console.log('⚠️  NENHUM pedido encontrado hoje no banco!')
    console.log('Isso indica que o checkout NÃO está criando pedidos.')
    await prisma.$disconnect()
    return
  }

  // Resumo por status
  const statusCounts = {}
  const storeSlugCounts = {}
  
  orders.forEach(order => {
    const status = order.status || '(null)'
    const slug = order.storeSlug || '(null)'
    statusCounts[status] = (statusCounts[status] || 0) + 1
    storeSlugCounts[slug] = (storeSlugCounts[slug] || 0) + 1
  })

  console.log('=== RESUMO POR STATUS ===')
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`- ${status}: ${count}`)
  })
  console.log()

  console.log('=== RESUMO POR STORESLUG ===')
  Object.entries(storeSlugCounts).forEach(([slug, count]) => {
    console.log(`- ${slug}: ${count}`)
  })
  console.log()

  console.log('=== DETALHES DOS PEDIDOS ===')
  orders.forEach((order, index) => {
    console.log(`\n[${index + 1}] Pedido #${order.numero}`)
    console.log(`  ID: ${order.id}`)
    console.log(`  Status: ${order.status}`)
    console.log(`  storeSlug: ${order.storeSlug || '(null)'}`)
    console.log(`  Criado em: ${order.criadoEm.toISOString()}`)
    console.log(`  Pago em: ${order.pagoEm ? order.pagoEm.toISOString() : '(não pago)'}`)
    console.log(`  Total: R$ ${order.totalAmount}`)
    console.log(`  Mercado Pago ID: ${order.mercadoPagoPaymentId || '(não)'}`)
    console.log(`  Cliente: ${order.Customer?.email} (${order.Customer?.nome || 'sem nome'})`)
    console.log(`  Produto: ${order.Produto?.nome} (${order.Produto?.slug})`)
  })

  // Pedidos sem storeSlug
  const nullSlugOrders = orders.filter(o => !o.storeSlug)
  if (nullSlugOrders.length > 0) {
    console.log(`\n⚠️  ${nullSlugOrders.length} pedidos SEM storeSlug:`)
    nullSlugOrders.forEach(order => {
      console.log(`  - #${order.numero} | ${order.status} | ${order.Customer?.email}`)
    })
  }

  // Pedidos sem Mercado Pago ID
  const noMpIdOrders = orders.filter(o => !o.mercadoPagoPaymentId)
  if (noMpIdOrders.length > 0) {
    console.log(`\n⚠️  ${noMpIdOrders.length} pedidos SEM Mercado Pago ID:`)
    noMpIdOrders.forEach(order => {
      console.log(`  - #${order.numero} | ${order.status} | ${order.Customer?.email}`)
    })
  }

  await prisma.$disconnect()
  console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===')
}

checkTodayOrders().catch(err => {
  console.error('Erro ao verificar pedidos:', err)
  process.exit(1)
})
