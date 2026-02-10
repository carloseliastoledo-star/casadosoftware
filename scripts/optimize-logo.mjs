import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(process.cwd())

const INPUT = path.join(root, 'app', 'public', 'logo-casa-do-software.png')
const OUT_WEBP = path.join(root, 'app', 'public', 'logo-casa-do-software.webp')
const OUT_PNG = path.join(root, 'app', 'public', 'logo-casa-do-software.png')
const OUT_PNG_BACKUP = path.join(root, 'app', 'public', 'logo-casa-do-software.original.png')
const OUT_PNG_TMP = path.join(root, 'app', 'public', 'logo-casa-do-software.optimized.tmp.png')

async function main() {
  if (!fs.existsSync(INPUT)) {
    throw new Error(`Input not found: ${INPUT}`)
  }

  if (!fs.existsSync(OUT_PNG_BACKUP)) {
    fs.copyFileSync(INPUT, OUT_PNG_BACKUP)
  }

  const image = sharp(INPUT)

  // Generate webp for modern browsers
  await image
    .clone()
    .resize({ width: 560, height: 560, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(OUT_WEBP)

  // Re-encode png smaller (keeps same filename used in many places)
  await image
    .clone()
    .resize({ width: 560, height: 560, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(OUT_PNG_TMP)

  try {
    fs.renameSync(OUT_PNG_TMP, OUT_PNG)
  } catch {
    try {
      fs.copyFileSync(OUT_PNG_TMP, OUT_PNG)
      fs.unlinkSync(OUT_PNG_TMP)
    } catch {
      // ignore
    }
  }

  console.log('Optimized logo written:')
  console.log('-', OUT_WEBP)
  console.log('-', OUT_PNG)
  console.log('Backup kept at:')
  console.log('-', OUT_PNG_BACKUP)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
