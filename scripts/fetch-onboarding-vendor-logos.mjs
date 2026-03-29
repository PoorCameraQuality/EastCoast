/**
 * Download logos for onboarded vendors (see docs/ONBOARD_LOGO_JOBS.json).
 * Run: node scripts/fetch-onboarding-vendor-logos.mjs
 */
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { mkdir } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const PUBLIC = join(root, 'public', 'images', 'vendors')
const PLACEHOLDER_PNG = join(root, 'public', 'og-image.png')
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function resolveLogoFetchUrl(websiteUrl) {
  try {
    const u = new URL(websiteUrl)
    if (u.hostname.includes('facebook.com')) {
      const parts = u.pathname.split('/').filter(Boolean)
      const page = parts[0] === 'people' ? parts[1] : parts[0]
      if (page) {
        return `https://graph.facebook.com/${page}/picture?type=large`
      }
    }
  } catch {
    /* ignore */
  }
  const enc = encodeURIComponent(websiteUrl)
  return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${enc}&size=128`
}

async function writePlaceholderLogo(outPath) {
  const buf = readFileSync(PLACEHOLDER_PNG)
  await mkdir(dirname(outPath), { recursive: true })
  await sharp(buf)
    .resize(125, 125, {
      fit: 'cover',
      position: 'centre',
    })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outPath)
}

async function tryDownloadToFile(fetchUrl, outPath) {
  const res = await fetch(fetchUrl, { headers: { 'User-Agent': UA }, redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 200) throw new Error(`too small (${buf.length}b)`)
  await mkdir(dirname(outPath), { recursive: true })
  await sharp(buf)
    .resize(125, 125, {
      fit: 'contain',
      background: { r: 18, g: 18, b: 22, alpha: 1 },
    })
    .flatten({ background: { r: 18, g: 18, b: 22 } })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(outPath)
}

async function main() {
  const jobs = JSON.parse(readFileSync(join(root, 'docs/ONBOARD_LOGO_JOBS.json'), 'utf8'))
  let failed = 0
  for (const { slug, url } of jobs) {
    const primary = resolveLogoFetchUrl(url)
    const fallback = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=128`
    const outPath = join(PUBLIC, slug, 'logo-125.jpg')
    try {
      try {
        await tryDownloadToFile(primary, outPath)
      } catch {
        try {
          await tryDownloadToFile(fallback, outPath)
        } catch {
          await writePlaceholderLogo(outPath)
        }
      }
      console.log('OK', slug)
    } catch (e) {
      console.log('FAIL', slug, e.message)
      failed++
    }
  }
  if (failed) process.exitCode = 1
}

main()
