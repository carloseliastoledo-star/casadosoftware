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
    handle: 'filesystem'
  },
  {
    src: '/(.*)',
    dest: '/__fallback'
  }
]

fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

console.log('Vercel output routes fixed: filesystem first, fallback -> /__fallback')
