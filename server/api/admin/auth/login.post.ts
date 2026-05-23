import { createError, defineEventHandler, readBody } from 'h3'
import { setAdminSession } from '../../../utils/adminSession.js'
import prisma from '../../../db/prisma'
import { hashPassword, verifyPassword } from '../../../utils/password.js'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  console.log('[admin/auth/login] ===== INÍCIO =====')
  
  const body = await readBody(event)

  const email = String(body?.email || '')
  const password = String(body?.password || '')

  const normalizedEmail = email.trim().toLowerCase()

  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || ''

  console.log('[admin/auth/login] Email:', normalizedEmail)
  console.log('[admin/auth/login] ADMIN_EMAIL configurado:', !!adminEmail)
  console.log('[admin/auth/login] ADMIN_PASSWORD configurado:', !!adminPassword)

  try {
    const dbUser = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } })
    console.log('[admin/auth/login] Usuário no banco:', dbUser ? 'SIM' : 'NÃO')
    
    if (dbUser) {
      const ok = verifyPassword(password, dbUser.passwordHash)
      console.log('[admin/auth/login] Senha coincide:', ok)
      
      if (ok) {
        const session = setAdminSession(event, dbUser.email)
        console.log('[admin/auth/login] Sessão criada com sucesso')
        return { ok: true, email: session.email }
      }

      // Se o usuário existe mas a senha não bate, ainda permitimos o "bootstrap" via env vars
      // para recuperar o acesso do admin.
      if (adminEmail && adminPassword && normalizedEmail === adminEmail && password === adminPassword) {
        console.log('[admin/auth/login] Recuperando senha via env vars')
        await prisma.adminUser.update({
          where: { email: normalizedEmail },
          data: {
            passwordHash: hashPassword(adminPassword),
            role: 'admin'
          }
        })

        const session = setAdminSession(event, normalizedEmail)
        return { ok: true, email: session.email }
      }

      throw createError({ statusCode: 401, statusMessage: 'Credenciais inválidas' })
    }
  } catch (err: any) {
    console.error('[admin/auth/login] Erro ao buscar usuário:', err)
    // Se a tabela ainda não existir (migração pendente), cai no bootstrap por env vars.
  }

  if (!adminEmail || !adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciais inválidas'
    })
  }

  if (normalizedEmail !== adminEmail || password !== adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Credenciais inválidas' })
  }

  console.log('[admin/auth/login] Criando/atualizando usuário via upsert')
  let createdEmail = normalizedEmail
  try {
    // Se for o admin master, garante que exista/esteja como admin
    const upserted = await prisma.adminUser.upsert({
      where: { email: normalizedEmail },
      create: {
        id: randomUUID(),
        email: normalizedEmail,
        passwordHash: hashPassword(adminPassword),
        role: 'admin'
      },
      update: {
        passwordHash: hashPassword(adminPassword),
        role: 'admin'
      }
    })
    createdEmail = upserted.email
    console.log('[admin/auth/login] Upsert realizado com sucesso:', upserted.email)
  } catch (upsertErr: any) {
    console.error('[admin/auth/login] Erro no upsert:', upsertErr)
    // Se não conseguir criar (ex: migração pendente), segue logando via env vars.
  }

  const session = setAdminSession(event, createdEmail)
  console.log('[admin/auth/login] Sessão criada (bootstrap):', session.email)
  return { ok: true, email: session.email }
})
