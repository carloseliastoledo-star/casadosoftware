import 'dotenv/config'
import mysql from 'mysql2/promise'
import crypto from 'crypto'

const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1
const KEY_LEN = 64

function randomSalt(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex')
}

function hashPassword(password) {
  const salt = randomSalt()
  const derived = crypto.scryptSync(password, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P
  })
  return `scrypt$${salt}$${derived.toString('hex')}`
}

async function main() {
  const adminEmail = 'carloseliastoledo@gmail.com'
  const adminPassword = 'admin123'
  
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
    
    // Gerar hash scrypt correto
    const passwordHash = hashPassword(adminPassword)
    
    // Atualizar senha do admin
    await connection.execute(
      'UPDATE AdminUser SET passwordHash = ? WHERE email = ?',
      [passwordHash, adminEmail]
    )
    
    console.log('✓ Senha atualizada com sucesso')
    console.log('Email:', adminEmail)
    console.log('Senha:', adminPassword)
    console.log('Hash format: scrypt')
    
    await connection.end()
    
  } catch (error) {
    console.error('Erro:', error.message)
    process.exit(1)
  }
}

main()
