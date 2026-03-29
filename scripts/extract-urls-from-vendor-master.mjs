import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = dirname(fileURLToPath(import.meta.url))
const md = readFileSync(
  join(root, '../docs/VENDOR_LEADS_MASTER_LISTING_SCAN_2026-03-29.md'),
  'utf8'
)
const found = new Set()
for (const m of md.matchAll(/https:\/\/[^\s)|`]+/g)) {
  let u = m[0].replace(/[,;.]+$/, '')
  found.add(u)
}
const lines = [...found].sort((a, b) => a.localeCompare(b))
const out = join(root, '../docs/VENDOR_LEADS_UNIQUE_URLS_2026-03-29.txt')
writeFileSync(out, lines.join('\n') + '\n', 'utf8')
console.log(out, lines.length)
