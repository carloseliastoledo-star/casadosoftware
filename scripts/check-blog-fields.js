import 'dotenv/config'
import mysql from 'mysql2/promise'

async function main() {
  const dbUrl = process.env.DATABASE_URL
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  const [, user, password, host, port, database] = match
  
  const connection = await mysql.createConnection({
    host, port: parseInt(port), user, password, database
  })
  
  console.log('=== CAMPOS DA TABELA BlogPost ===\n')
  
  // Verificar campos da tabela
  const [columns] = await connection.execute(
    'SHOW COLUMNS FROM BlogPost'
  )
  
  console.log('Campos encontrados:')
  columns.forEach(c => {
    console.log(`- ${c.Field} (${c.Type})`)
  })
  
  console.log('\n=== VALORES DE publicado ===')
  try {
    const [rows] = await connection.execute(
      'SELECT publicado, COUNT(*) as count FROM BlogPost GROUP BY publicado'
    )
    rows.forEach(r => {
      console.log(`- publicado=${r.publicado}: ${r.count}`)
    })
  } catch (e) {
    console.log('Campo publicado não existe ou erro:', e.message)
  }
  
  console.log('\n=== VALORES DE status ===')
  try {
    const [rows] = await connection.execute(
      'SELECT status, COUNT(*) as count FROM BlogPost GROUP BY status'
    )
    rows.forEach(r => {
      console.log(`- status=${r.status}: ${r.count}`)
    })
  } catch (e) {
    console.log('Campo status não existe ou erro:', e.message)
  }
  
  console.log('\n=== TOTAL ===')
  const [total] = await connection.execute(
    'SELECT COUNT(*) as count FROM BlogPost'
  )
  console.log('Total de blogs:', total[0].count)
  
  await connection.end()
}

main()
