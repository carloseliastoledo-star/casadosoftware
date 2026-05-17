import 'dotenv/config'

async function testBlogAPI() {
  try {
    const baseUrl = process.env.SITE_URL || 'https://casadosoftware.com.br'
    
    console.log('Testando API de blogs...')
    console.log('URL:', `${baseUrl}/api/blog`)
    
    const response = await fetch(`${baseUrl}/api/blog`)
    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Posts retornados:', data.posts?.length || 0)
    
    if (data.posts && data.posts.length > 0) {
      console.log('\nPrimeiro post:')
      console.log('- Título:', data.posts[0].titulo)
      console.log('- Slug:', data.posts[0].slug)
    } else {
      console.log('\n⚠️ Nenhum post retornado')
    }
    
  } catch (error) {
    console.error('Erro:', error.message)
  }
}

testBlogAPI()
