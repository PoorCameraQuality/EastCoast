/**
 * Split vendor slugs into 10 batches for parallel SEO review agents.
 * Run from repo root: node scripts/build-vendor-seo-batches.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = dirname(fileURLToPath(import.meta.url))
const vendorsPath = join(root, '../src/data/vendors.js')
const onboardedPath = join(root, '../src/data/onboardedVendors.data.js')
const txt = readFileSync(vendorsPath, 'utf8')
const onboardedTxt = readFileSync(onboardedPath, 'utf8')
const slugs = [...txt.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])
const onboardedSlugs = [...onboardedTxt.matchAll(/"slug":\s*"([^"]+)"/g)].map((m) => m[1])
const uniq = [...new Set([...slugs, ...onboardedSlugs])]

const nb = 10
const base = Math.floor(uniq.length / nb)
let extra = uniq.length % nb
let idx = 0
const batches = []
for (let b = 0; b < nb; b++) {
  const n = base + (extra > 0 ? 1 : 0)
  if (extra > 0) extra--
  batches.push(uniq.slice(idx, idx + n))
  idx += n
}

const out = join(root, '../docs/VENDOR_SEO_SLUG_BATCHES.json')
writeFileSync(
  out,
  JSON.stringify({ totalSlugs: uniq.length, batchCount: batches.length, batches }, null, 2),
  'utf8'
)
console.log(out, uniq.length, 'slugs, batch sizes', batches.map((b) => b.length))
