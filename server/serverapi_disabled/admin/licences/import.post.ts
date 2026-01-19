import prisma from '../../../db/prisma'







export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { product_id, keys } = body

  if (!product_id || !keys) {
    throw createError({
      statusCode: 400,
      statusMessage: 'product_id e keys são obrigatórios'
    })
  }

  const licenses = keys
    .split('\n')
    .map((k: string) => k.trim())
    .filter((k: string) => k.length > 10)

  if (licenses.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nenhuma licença válida encontrada'
    })
  }

  const data = licenses.map((key: string) => ({
    product_id,
    license_key: key
  }))

  const result = await prisma.productLicense.createMany({
    data,
    skipDuplicates: true
  })

  return {
    inserted: result.count
  }
})
