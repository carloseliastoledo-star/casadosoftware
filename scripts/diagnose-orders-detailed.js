import 'dotenv/config'
import mysql from 'mysql2/promise'

async function main() {
  const dbUrl = process.env.DATABASE_URL
  
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  const [, user, password, host, port, database] = match
  
  const connection = await mysql.createConnection({
    host, port: parseInt(port), user, password, database
  })
  
  console.log('=== DIAGNÓSTICO DETALHADO - TABELA Order ===\n')
  
  // 1. Total de pedidos
  const [total] = await connection.execute('SELECT COUNT(*) as count FROM `Order`')
  console.log('1. Total de pedidos:', total[0].count)
  
  // 2. Por storeSlug
  console.log('\n2. Pedidos por storeSlug:')
  const [storeSlugs] = await connection.execute(
    'SELECT storeSlug, COUNT(*) as count FROM `Order` GROUP BY storeSlug'
  )
  storeSlugs.forEach(s => {
    console.log(`   ${s.storeSlug || '(null)'}: ${s.count}`)
  })
  
  // 3. deletedAt
  console.log('\n3. deletedAt:')
  const [deletedNull] = await connection.execute(
    'SELECT COUNT(*) as count FROM `Order` WHERE deletedAt IS NULL'
  )
  const [deletedNotNull] = await connection.execute(
    'SELECT COUNT(*) as count FROM `Order` WHERE deletedAt IS NOT NULL'
  )
  console.log(`   deletedAt IS NULL: ${deletedNull[0].count}`)
  console.log(`   deletedAt IS NOT NULL: ${deletedNotNull[0].count}`)
  
  // 4. Por status
  console.log('\n4. Pedidos por status:')
  const [statuses] = await connection.execute(
    'SELECT status, COUNT(*) as count FROM `Order` GROUP BY status'
  )
  statuses.forEach(s => {
    console.log(`   ${s.status}: ${s.count}`)
  })
  
  // 5. Campos de data
  console.log('\n5. Verificar campos de data:')
  const [dateSample] = await connection.execute(
    'SELECT criadoEm, pagoEm FROM `Order` WHERE criadoEm IS NOT NULL LIMIT 1'
  )
  if (dateSample.length > 0) {
    console.log(`   criadoEm: ${dateSample[0].criadoEm}`)
    console.log(`   pagoEm: ${dateSample[0].pagoEm}`)
  }
  
  // 6. Verificar createdAt (se existe)
  try {
    const [createdAt] = await connection.execute(
      'SELECT COUNT(*) as count FROM `Order` WHERE createdAt IS NOT NULL'
    )
    console.log(`\n6. createdAt existe: ${createdAt[0].count} registros`)
  } catch (e) {
    console.log(`\n6. createdAt: campo não existe (usa criadoEm)`)
  }
  
  // 7. Verificar campos obrigatórios nulos
  console.log('\n7. Verificação de campos importantes:')
  const [nullStoreSlug] = await connection.execute(
    'SELECT COUNT(*) as count FROM `Order` WHERE storeSlug IS NULL'
  )
  const [nullCustomerId] = await connection.execute(
    'SELECT COUNT(*) as count FROM `Order` WHERE customerId IS NULL'
  )
  console.log(`   storeSlug IS NULL: ${nullStoreSlug[0].count}`)
  console.log(`   customerId IS NULL: ${nullCustomerId[0].count}`)
  
  // 8. Verificar se existe produtoId
  const [nullProdutoId] = await connection.execute(
    'SELECT COUNT(*) as count FROM `Order` WHERE produtoId IS NULL'
  )
  console.log(`   produtoId IS NULL: ${nullProdutoId[0].count}`)
  
  await connection.end()
  console.log('\n=== FIM DO DIAGNÓSTICO ===')
}

main()
