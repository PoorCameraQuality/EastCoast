/**
 * Fetch homepage HTML and download best available branding image:
 * og:image, twitter:image, apple-touch-icon, or icon link.
 *
 *   node scripts/harvest-dungeon-logos.mjs
 */
import { execFileSync } from 'child_process'
import { writeFileSync, mkdirSync, statSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const out = join(root, 'public', 'images', 'dungeons')
mkdirSync(out, { recursive: true })

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'

function curlText(url) {
  const curl = process.platform === 'win32' ? 'curl.exe' : 'curl'
  return execFileSync(curl, ['-fsSL', '-L', '-A', UA, url], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  })
}

function curlBin(url, dest) {
  const curl = process.platform === 'win32' ? 'curl.exe' : 'curl'
  execFileSync(curl, ['-fsSL', '-L', '-A', UA, '-o', dest, url], {
    stdio: 'inherit',
  })
}

function absUrl(base, rel) {
  if (!rel) return null
  const t = rel.trim()
  if (t.startsWith('http')) return t.replace(/&amp;/g, '&')
  try {
    return new URL(t, base).href
  } catch {
    return null
  }
}

function meta(html, prop, attr = 'property') {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${prop}["'][^>]+content=["']([^"']+)["']`,
    'i',
  )
  let m = html.match(re)
  if (m) return m[1].replace(/&amp;/g, '&')
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${prop}["']`,
    'i',
  )
  m = html.match(re2)
  return m ? m[1].replace(/&amp;/g, '&') : null
}

function linkHref(html, rel) {
  const re = new RegExp(
    `<link[^>]+rel=["'][^"']*${rel}[^"']*["'][^>]+href=["']([^"']+)["']`,
    'i',
  )
  let m = html.match(re)
  if (m) return m[1].replace(/&amp;/g, '&')
  const re2 = new RegExp(
    `<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${rel}[^"']*["']`,
    'i',
  )
  m = html.match(re2)
  return m ? m[1].replace(/&amp;/g, '&') : null
}

/** Meta tags without quoted attributes, e.g. content=https://... property=og:image */
function metaUnquotedOgImage(html) {
  const m = html.match(
    /<meta[^>]*\bcontent=(https?:\/\/[^\s>]+)[^>]*\bproperty=["']?og:image["']?/i,
  )
  if (m) return m[1].replace(/&amp;/g, '&')
  const m2 = html.match(
    /<meta[^>]*\bproperty=["']?og:image["']?[^>]*\bcontent=(https?:\/\/[^\s>]+)/i,
  )
  return m2 ? m2[1].replace(/&amp;/g, '&') : null
}

function pickImageUrl(base, html) {
  return (
    meta(html, 'og:image') ||
    meta(html, 'og:image:url') ||
    meta(html, 'twitter:image', 'name') ||
    meta(html, 'twitter:image:src', 'name') ||
    metaUnquotedOgImage(html) ||
    linkHref(html, 'apple-touch-icon') ||
    linkHref(html, 'icon') ||
    linkHref(html, 'shortcut icon')
  )
}

const jobs = [
  { page: 'https://www.denversanctuary.com/', file: 'logo-denver-sanctuary' },
  { page: 'https://rackroomdenver.com/', file: 'logo-rack-room-denver' },
  { page: 'https://thresholdla.org/', file: 'logo-threshold-los-angeles' },
  { page: 'https://kinkcenter.org/', file: 'logo-kink-center-seattle' },
  { page: 'https://subspaceseattle.com/', file: 'logo-subspace-seattle' },
  { page: 'https://pdxsanctuary.com/', file: 'logo-sanctuary-portland' },
  { page: 'https://subrosapdx.com/', file: 'logo-sub-rosa-portland' },
  { page: 'https://black-thorn.org/', file: 'logo-black-thorn-oakland' },
  { page: 'https://thecspc.org/', file: 'logo-cspc-seattle' },
  { page: 'https://purgatorydungeon.com/', file: 'logo-purgatory-dungeon-albuquerque' },
  { page: 'https://www.alaskaclubkink.com/', file: 'logo-alaska-club-kink' },
  { page: 'https://www.thecrowsnestescape.com/', file: 'logo-crows-nest-seattle' },
  { page: 'https://stl3.com/', file: 'logo-stl3-st-louis' },
  {
    page: 'https://www.oklahomapowerexchange.com/',
    file: 'logo-oklahoma-power-exchange-okc',
  },
]

for (const job of jobs) {
  try {
    const html = curlText(job.page)
    const rel = pickImageUrl(job.page, html)
    const imgUrl = absUrl(job.page, rel)
    if (!imgUrl) {
      console.error('NO_IMAGE_URL', job.page)
      continue
    }
    const ext = extname(new URL(imgUrl).pathname).toLowerCase()
    const useExt =
      ext && ext.length <= 5 && ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)
        ? ext
        : '.png'
    const dest = join(out, `${job.file}${useExt}`)
    curlBin(imgUrl, dest)
    const n = statSync(dest).size
    if (n < 80) {
      console.error('TOO_SMALL', dest, n)
      continue
    }
    console.log('OK', dest, n, '<-', imgUrl)
  } catch (e) {
    console.error('FAIL', job.page, e.message)
  }
}
