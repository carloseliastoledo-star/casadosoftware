import 'dotenv/config'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

async function main() {
  const adminEmail = 'carloseliastoledo@gmail.com'
  const adminPassword = 'admin123'
  
  // Parse DATABASE_URL
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('DATABASE_URL não encontrada')
    process.exit(1)
  }
  
  // Extrair credenciais da URL mysql://user:pass@host:port/db
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
    
    // Verificar se tabela AdminUser existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'AdminUser'"
    )
    
    if (tables.length === 0) {
      console.log('Tabela AdminUser não existe. Criando...')
      
      await connection.execute(`
        CREATE TABLE AdminUser (
          id VARCHAR(191) NOT NULL PRIMARY KEY,
          email VARCHAR(191) NOT NULL UNIQUE,
          passwordHash VARCHAR(191) NOT NULL,
          role ENUM('admin', 'editor', 'agent') NOT NULL DEFAULT 'admin',
          createdAt DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('✓ Tabela AdminUser criada')
    }
    
    // Verificar se admin já existe
    const [existing] = await connection.execute(
      'SELECT id FROM AdminUser WHERE email = ?',
      [adminEmail]
    )
    
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    
    if (existing.length > 0) {
      // Atualizar
      await connection.execute(
        'UPDATE AdminUser SET passwordHash = ?, role = ? WHERE email = ?',
        [passwordHash, 'admin', adminEmail]
      )
      console.log('✓ Admin atualizado')
    } else {
      // Criar
      await connection.execute(
        'INSERT INTO AdminUser (id, email, passwordHash, role) VALUES (?, ?, ?, ?)',
        ['admin-casadosoftware', adminEmail, passwordHash, 'admin']
      )
      console.log('✓ Admin criado')
    }
    
    console.log('Email:', adminEmail)
    console.log('Senha temporária: admin123')
    console.log('Role: admin')
    
    await connection.end()
    
  } catch (error) {
    console.error('Erro:', error.message)
    process.exit(1)
  }
}

main()
