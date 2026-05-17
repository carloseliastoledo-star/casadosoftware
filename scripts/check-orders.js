import 'dotenv/config'
import mysql from 'mysql2/promise'

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('DATABASE_URL não encontrada')
    process.exit(1)
  }
  
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  if (!match) {
    console.error('DATABASE_URL inválida')
    process.exit(1)
  }
  
  const [, user, password, host, port, database] = match
  
  try {
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database
    })
    
    // Verificar total de pedidos
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM `Order`'
    )
    const total = countResult[0].total
    
    console.log('Total de pedidos:', total)
    
    if (total > 0) {
      // Listar os últimos 5 pedidos
      const [orders] = await connection.execute(
        'SELECT id, numero, status, customerId, totalAmount, criadoEm FROM `Order` ORDER BY criadoEm DESC LIMIT 5'
      )
      console.log('\nÚltimos pedidos:')
      orders.forEach(o => {
        console.log(`- #${o.numero} | Status: ${o.status} | Total: ${o.totalAmount} | ${o.criadoEm}`)
      })
    } else {
      console.log('\nNenhum pedido encontrado no banco de dados.')
    }
    
    await connection.end()
    
  } catch (error) {
    console.error('Erro:', error.message)
    process.exit(1)
  }
}

main()
