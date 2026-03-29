import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = dirname(fileURLToPath(import.meta.url))
const md = readFileSync(
  join(root, '../docs/VENDOR_LEADS_MASTER_LISTING_SCAN_2026-03-29.md'),
  'utf8'
)

const rows = []
const lines = md.split('\n')
let inTable = false
for (const line of lines) {
  if (line.startsWith('| Vendor / brand |')) {
    inTable = true
    continue
  }
  if (inTable && line.startsWith('|---')) continue
  if (inTable && line.startsWith('|') && line.includes('http')) {
    const cells = line.split('|').map((c) => c.trim())
    if (cells.length >= 4 && cells[1] && cells[2]?.startsWith('http')) {
      rows.push({
        brand: cells[1],
        url: cells[2],
        eckeListing: cells[3],
        notes: cells[4] || '',
      })
    }
    continue
  }
  if (inTable && line.startsWith('**')) {
    inTable = false
  }
}

const nb = 10
const size = Math.ceil(rows.length / nb)
const batches = []
for (let i = 0; i < nb; i++) {
  batches.push(rows.slice(i * size, (i + 1) * size))
}

const out = join(root, '../docs/VENDOR_CURATION_BATCHES.json')
writeFileSync(
  out,
  JSON.stringify(
    {
      criteria:
        'ECKE handmade / maker vendors who vend at cons & dungeons — exclude travel, cruises, ticketing, hotels, CVB, pure nonprofit/advocacy, chiropractors/telehealth, event orgs, photographers, web design, mailchimp, club venues, mass retail chains unless clearly artisan subsection',
      totalRows: rows.length,
      batches,
    },
    null,
    2
  ),
  'utf8'
)
console.log(out, 'rows', rows.length, 'batch sizes', batches.map((b) => b.length))
