import 'dotenv/config'
import mysql from 'mysql2/promise'

async function main() {
  const dbUrl = process.env.DATABASE_URL
  
  console.log('=== DIAGNÓSTICO DO BANCO ===\n')
  console.log('DATABASE_URL usada:')
  console.log(dbUrl?.replace(/:[^:@]+@/, ':****@'))
  console.log('')
  
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  if (!match) {
    console.error('DATABASE_URL inválida')
    process.exit(1)
  }
  
  const [, user, password, host, port, database] = match
  
  console.log('Host:', host)
  console.log('Porta:', port)
  console.log('Banco:', database)
  console.log('')
  
  try {
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database
    })
    
    // Verificar tabelas existentes
    const [tables] = await connection.execute(
      "SHOW TABLES"
    )
    
    console.log('Tabelas encontradas:', tables.length)
    console.log('')
    
    // Contar registros em tabelas importantes
    const tabelas = [
      '`Order`',
      'BlogPost',
      'Product',
      'Produto',
      'Category',
      'Categoria',
      'CustomerAdmin',
      'AdminUser',
      'Customer',
      'Affiliate',
      'Cupom',
      'Licenca',
      'LicenseAccount'
    ]
    
    console.log('Contagem de registros:')
    console.log('-'.repeat(40))
    
    for (const tabela of tabelas) {
      try {
        const [result] = await connection.execute(
          `SELECT COUNT(*) as total FROM ${tabela}`
        )
        const count = result[0].total
        const emoji = count > 0 ? '✓' : '⚠️'
        console.log(`${emoji} ${tabela}: ${count}`)
      } catch (e) {
        // Tabela não existe
      }
    }
    
    await connection.end()
    
  } catch (error) {
    console.error('Erro:', error.message)
    process.exit(1)
  }
}

main()
