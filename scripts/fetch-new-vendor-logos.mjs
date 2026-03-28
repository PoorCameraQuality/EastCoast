/**
 * Download and normalize vendor logos to public/images/vendors/{slug}/logo-125.jpg
 * Sources: public pages, Facebook graph profile pics where shop HTML is blocked, Google favicon for Etsy-only.
 *
 * Lovely Marks: Etsy/lovelymarks automated raster fetch returned SVG/HTML; use
 * public/images/vendors/lovely-marks/logo-source.svg and:
 *   node -e "import sharp from 'sharp'; import {readFile} from 'fs/promises'; ..."
 * (or regenerate logo-125.jpg from that SVG when updating branding).
 *
 * Run: node scripts/fetch-new-vendor-logos.mjs
 */
import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public', 'images', 'vendors')

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const JOBS = [
  {
    slug: 'addisons-jewelry-and-design',
    url: 'https://graph.facebook.com/addisonsjewelry/picture?type=large',
    note: 'Facebook page image (no og:image on site)',
  },
  {
    slug: 'lovely-marks',
    url: 'http://lovelymarkstoys.etsy.com/favicon.ico',
    note: 'Favicon from lovelymarks.com redirect target (Etsy shop subdomain)',
  },
  {
    slug: 'ransom-woodcrafts',
    url: 'https://graph.facebook.com/ransomwoodcrafts/picture?type=large',
    note: 'Facebook page image (Etsy shop HTML blocked)',
  },
  {
    slug: 'broken-lance-after-dark',
    url: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.etsy.com/shop/BrokenLanceAfterDark&size=128',
    note: 'Google favicon resolver for Etsy shop URL (Etsy HTML blocked)',
  },
  {
    slug: 'chubby-bunny-trinkets',
    url: 'https://chubbybunny.wtf/pictures/CBLogo.png',
    note: 'Official site logo asset',
  },
  {
    slug: 'soaring-eagle-creations',
    url: 'https://soaringeaglecreations.com/wp-content/uploads/2023/03/cropped-eagle_concho-180x180.jpg',
    note: 'WordPress apple-touch-icon / cropped site logo',
  },
  {
    slug: 'kneel-grain',
    url: 'https://graph.facebook.com/61582199684459/picture?type=large',
    note: 'Facebook page profile image (numeric page id from /people/Kneel-Grain/61582199684459/)',
  },
]

async function main() {
  for (const { slug, url, note } of JOBS) {
    const outDir = join(PUBLIC, slug)
    const outPath = join(outDir, 'logo-125.jpg')
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 200) throw new Error(`too small (${buf.length}b)`)
      await mkdir(outDir, { recursive: true })
      await sharp(buf)
        .resize(125, 125, {
          fit: 'contain',
          background: { r: 18, g: 18, b: 22, alpha: 1 },
        })
        .flatten({ background: { r: 18, g: 18, b: 22 } })
        .jpeg({ quality: 90, mozjpeg: true })
        .toFile(outPath)
      console.log('OK', slug, note)
    } catch (e) {
      console.error('FAIL', slug, e.message, '|', note)
      process.exitCode = 1
    }
  }
}

main()
