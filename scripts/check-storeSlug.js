import 'dotenv/config'
import mysql from 'mysql2/promise'

async function main() {
  const dbUrl = process.env.DATABASE_URL
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  const [, user, password, host, port, database] = match
  
  const connection = await mysql.createConnection({
    host, port: parseInt(port), user, password, database
  })
  
  console.log('Valores de storeSlug:')
  const [rows] = await connection.execute(
    'SELECT DISTINCT storeSlug FROM `Order` LIMIT 10'
  )
  rows.forEach(r => {
    console.log(`- "${r.storeSlug}"`)
  })
  
  await connection.end()
}

main()
