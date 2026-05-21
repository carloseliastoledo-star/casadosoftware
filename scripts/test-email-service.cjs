const { sendEmail } = require('./server/services/emailService.ts')

async function testEmailWithoutSMTP() {
  console.log('Testando envio de e-mail sem SMTP configurado...')
  
  // Remover variáveis de ambiente temporariamente
  const originalEnv = { ...process.env }
  delete process.env.SMTP_HOST
  delete process.env.SMTP_PORT
  delete process.env.SMTP_USER
  delete process.env.SMTP_PASS
  delete process.env.SMTP_FROM
  
  const result = await sendEmail({
    to: 'test@example.com',
    subject: 'Teste',
    html: '<p>Teste</p>'
  })
  
  console.log('Resultado:', result)
  
  if (!result.success && result.error.includes('SMTP não configurado')) {
    console.log('✓ Teste passou: erro controlado retornado quando SMTP não configurado')
  } else {
    console.log('✗ Teste falhou: comportamento inesperado')
  }
  
  // Restaurar variáveis de ambiente
  Object.assign(process.env, originalEnv)
}

testEmailWithoutSMTP()
