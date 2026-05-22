/**
 * Middleware otimizado para bloquear URLs de bots
 * Usa lista reduzida de padrões mais comuns
 * Protege crawlers legítimos de SEO e social media
 */

// Crawlers legítimos que NÃO devem ser bloqueados
const LEGITIMATE_CRAWLERS = [
  'googlebot',
  'bingbot',
  'slurp', // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'adsbot-google',
  'google-inspectiontool',
  'pagespeed',
  'lighthouse'
]

// Apenas os padrões mais comuns e perigosos
const BLOCKED_PATTERNS = [
  // WordPress
  /^\/wp-admin/,
  /^\/wp-login/,
  /^\/xmlrpc\.php/,
  /^\/wp-json/,
  
  // Adminer/phpMyAdmin
  /^\/adminer/,
  /^\/phpmyadmin/,
  /^\/pma/,
  
  // Arquivos sensíveis
  /^\/\.env/,
  /^\/\.git/,
  /^\/\.htaccess/,
  /^\/phpinfo\.php/,
  /^\/info\.php/,
  /^\/test\.php/,
  /^\/debug\.php/,
  
  // Vendor e pacotes
  /^\/vendor\//,
  /^\/node_modules\//,
  /^\/composer\.json/,
  /^\/package\.json/,
  
  // CGI e bin
  /^\/cgi-bin/,
  /^\/awstats/,
  
  // Logs e arquivos de sistema
  /^\/logs/,
  /^\/backup/,
  /^\/tmp/,
  /^\/cache/,
  
  // Uploads e downloads
  /^\/uploads?\//,
  /^\/downloads?\//,
]

function isLegitimateCrawler(userAgent: string): boolean {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return LEGITIMATE_CRAWLERS.some(crawler => ua.includes(crawler))
}

export default defineNuxtRouteMiddleware((event) => {
  const path = event.path || ''
  const userAgent = event.node?.req?.headers['user-agent'] as string || ''
  
  // Não bloquear crawlers legítimos
  if (isLegitimateCrawler(userAgent)) {
    return
  }
  
  // Testa apenas os padrões mais comuns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(path)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found'
      })
    }
  }
})
