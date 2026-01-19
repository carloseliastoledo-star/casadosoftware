import { writeFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo não enviado' })
  }

  const file = formData.find(f => f.name === 'file')

  if (!file || !file.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo inválido' })
  }

  const fileName = `${Date.now()}-${file.filename}`
  const filePath = join(process.cwd(), 'public/uploads', fileName)

  await writeFile(filePath, file.data)

  return {
    url: `/uploads/${fileName}`
  }
})
