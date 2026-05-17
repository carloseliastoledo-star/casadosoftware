import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@casadosoftware.com.br'
  const adminName = 'Administrador'
  const adminPassword = 'admin123' // Senha temporária - deve ser alterada após login
  const adminRole = 'ADMIN'
  const adminStatus = 'ACTIVE'

  try {
    // Verificar se já existe admin com esse email
    const existingAdmin = await prisma.customerAdmin.findFirst({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      // Atualizar admin existente
      const passwordHash = await bcrypt.hash(adminPassword, 10)
      
      await prisma.customerAdmin.update({
        where: { id: existingAdmin.id },
        data: {
          passwordHash,
          role: adminRole.toLowerCase(),
          status: adminStatus.toLowerCase(),
          name: adminName
        }
      })
      
      console.log('✓ Admin atualizado com sucesso')
      console.log('Email:', adminEmail)
      console.log('Role:', adminRole)
      console.log('Status:', adminStatus)
      return
    }

    // Criar Customer para o admin (necessário devido ao relacionamento)
    const customer = await prisma.customer.upsert({
      where: { email: 'internal@casadosoftware.com.br' },
      update: {},
      create: {
        id: 'customer-internal-admin',
        name: 'Admin Internal',
        email: 'internal@casadosoftware.com.br',
        licenseLimit: 0,
        status: 'active'
      }
    })

    // Criar hash da senha
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    // Criar novo admin
    const newAdmin = await prisma.customerAdmin.create({
      data: {
        customerId: customer.id,
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: adminRole.toLowerCase(),
        status: adminStatus.toLowerCase()
      }
    })

    console.log('✓ Admin criado com sucesso')
    console.log('Email:', newAdmin.email)
    console.log('Name:', newAdmin.name)
    console.log('Role:', newAdmin.role)
    console.log('Status:', newAdmin.status)
    console.log('Customer ID:', newAdmin.customerId)

  } catch (error) {
    console.error('✗ Erro ao criar admin:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
