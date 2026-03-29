/**
 * Parse VENDOR_HANDMADE_CONSIDERATION_LIST_*.md recommended table,
 * drop rows already in vendors.js (by host/path), optionally resolve Etsy short links,
 * write docs/VENDOR_NET_NEW.json + docs/VENDOR_ONBOARDING_BATCHES.json
 *
 * Run: node scripts/build-vendor-net-new-and-batches.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mdPath = join(root, 'docs/VENDOR_HANDMADE_CONSIDERATION_LIST_2026-03-29.md')

/** Hostname or full URL prefix → skip (already listed or duplicate product line) */
const SKIP_URL_MATCHERS = [
  'barkingleather.com',
  'bllenterprises.com',
  'etsy.com/shop/BrokenLanceAfterDark',
  'canelove.com',
  'deliciousboutique.com',
  'efleathercraft.com',
  'emmaalamo.com',
  'etsy.com/shop/FlogginFarmers',
  'hololeathers.com',
  'kinbaku-studio.com',
  'kinkthinkfactory.com',
  'snmleatherworks.com',
  'thebeavwoodcrafting.com',
  'uniquekink.com',
]

function normalizeUrlForMatch(u) {
  try {
    const x = new URL(u.startsWith('http') ? u : `https://${u}`)
    return `${x.hostname.replace(/^www\./, '')}${x.pathname}`.toLowerCase()
  } catch {
    return u.toLowerCase()
  }
}

function shouldSkip(url) {
  const n = normalizeUrlForMatch(url)
  return SKIP_URL_MATCHERS.some((m) => {
    const mc = m.toLowerCase().replace(/^www\./, '')
    return n.includes(mc)
  })
}

function canonicalShopUrl(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('etsy.com') && u.pathname.includes('/shop/')) {
      u.search = ''
      u.hash = ''
      return u.toString()
    }
  } catch {
    /* ignore */
  }
  return url
}

async function resolveEtsyShort(url) {
  if (!url.includes('etsy.me/')) return url
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    return r.url || url
  } catch {
    return url
  }
}

function parseRecommendedTable(md) {
  const rows = []
  const lines = md.split('\n')
  let inRec = false
  for (const line of lines) {
    if (line.startsWith('## Recommended for')) {
      inRec = true
      continue
    }
    if (inRec && line.startsWith('## ')) break
    if (!inRec || !line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map((c) => c.trim())
    if (cells.length < 4 || cells[1] === 'Brand') continue
    const brand = cells[1]
    const website = cells[2]
    const notes = cells[3] || ''
    if (!website?.startsWith('http')) continue
    rows.push({ brand, websiteUrl: website, notes })
  }
  return rows
}

async function main() {
  const md = readFileSync(mdPath, 'utf8')
  const raw = parseRecommendedTable(md)
  const filtered = raw.filter((r) => !shouldSkip(r.websiteUrl))

  const resolved = []
  for (const r of filtered) {
    let websiteUrl = await resolveEtsyShort(r.websiteUrl)
    websiteUrl = canonicalShopUrl(websiteUrl)
    resolved.push({ ...r, websiteUrl })
  }

  const nb = Math.min(10, Math.max(1, resolved.length))
  const base = Math.floor(resolved.length / nb)
  let extra = resolved.length % nb
  let idx = 0
  const batches = []
  for (let b = 0; b < nb; b++) {
    const n = base + (extra > 0 ? 1 : 0)
    if (extra > 0) extra--
    batches.push(resolved.slice(idx, idx + n))
    idx += n
  }

  const netNewPath = join(root, 'docs/VENDOR_NET_NEW.json')
  writeFileSync(
    netNewPath,
    JSON.stringify(
      {
        source: 'docs/VENDOR_HANDMADE_CONSIDERATION_LIST_2026-03-29.md',
        excludedMatchers: SKIP_URL_MATCHERS,
        totalRecommended: raw.length,
        netNewCount: resolved.length,
        vendors: resolved,
      },
      null,
      2
    ),
    'utf8'
  )

  const batchPath = join(root, 'docs/VENDOR_ONBOARDING_BATCHES.json')
  writeFileSync(
    batchPath,
    JSON.stringify(
      {
        criteria:
          'Handmade / small-batch makers who table at cons & dungeons. Human-review-queue brands excluded from source table.',
        netNewCount: resolved.length,
        batchCount: batches.length,
        batches,
      },
      null,
      2
    ),
    'utf8'
  )

  console.log(netNewPath, 'net-new', resolved.length, 'from', raw.length)
  console.log(
    batchPath,
    'batch sizes',
    batches.map((b) => b.length)
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
