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
    
    // Verificar se tabela BlogPost existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'BlogPost'"
    )
    
    if (tables.length === 0) {
      console.log('❌ Tabela BlogPost não existe!')
      await connection.end()
      return
    }
    
    // Verificar total de blogs
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM BlogPost'
    )
    const total = countResult[0].total
    
    console.log('✓ Total de blogs:', total)
    
    if (total > 0) {
      // Listar blogs públicos
      const [blogs] = await connection.execute(
        'SELECT id, titulo, slug, publicado, criadoEm FROM BlogPost WHERE publicado = true ORDER BY criadoEm DESC LIMIT 5'
      )
      console.log('\nÚltimos blogs públicos:')
      blogs.forEach(b => {
        console.log(`- ${b.titulo} | /blog/${b.slug} | ${b.criadoEm}`)
      })
    } else {
      console.log('\n⚠️ Nenhum blog encontrado')
    }
    
    await connection.end()
    
  } catch (error) {
    console.error('Erro:', error.message)
    process.exit(1)
  }
}

main()
