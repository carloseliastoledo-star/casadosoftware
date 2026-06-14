require('dotenv').config({ path: '/root/apps/casadosoftware/.env' })

module.exports = {
  apps: [
    {
      name: 'casadosoftware',
      cwd: '/root/apps/casadosoftware',
      script: '.output/server/index.mjs',
      interpreter: 'node',
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    }
  ]
}
