const fs = require('fs')
const path = require('path')

function loadEnv(file) {
  const envPath = path.join(__dirname, file)
  const env = {}

  if (!fs.existsSync(envPath)) return env

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const index = trimmed.indexOf('=')
    if (index === -1) continue

    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[key] = value
  }

  return env
}

module.exports = {
  apps: [
    {
      name: 'casadosoftware',
      cwd: '/root/apps/casadosoftware',
      script: '.output/server/index.mjs',
      exec_mode: 'fork',
      instances: 1,
      env: loadEnv('.env')
    }
  ]
}
