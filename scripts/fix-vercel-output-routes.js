// scripts/fix-vercel-output-routes.js
const fs = require('fs')
const path = require('path')

const configPath = path.join(process.cwd(), '.vercel', 'output', 'config.json')

let config = {}

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
}

config.version = 3

config.routes = [
  {
    src: '/(.*)',
    dest: '/__fallback.func'
  }
]

fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

console.log('Vercel output routes fixed: all requests -> /__fallback.func')
