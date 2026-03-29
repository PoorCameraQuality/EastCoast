import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function extractRecords(file, type) {
  const text = readFileSync(join(root, 'src/data', file), 'utf8')
  const out = []
  const re =
    /"name":\s*"([^"]+)"[\s\S]*?"website":\s*"([^"]+)"/g
  let m
  while ((m = re.exec(text)) !== null) {
    out.push({ type, name: m[1], url: m[2] })
  }
  return out
}

const events = extractRecords('events.js', 'event')
const dungeons = extractRecords('dungeons.js', 'dungeon')
const byKey = new Map()
for (const r of [...events, ...dungeons]) {
  const key = r.url.replace(/\/$/, '').toLowerCase()
  if (!byKey.has(key)) byKey.set(key, r)
}
const list = [...byKey.values()].sort((a, b) => a.url.localeCompare(b.url))

const nb = 5
const size = Math.ceil(list.length / nb)
const batches = []
for (let i = 0; i < nb; i++) {
  batches.push(list.slice(i * size, (i + 1) * size))
}

const outPath = join(root, 'docs', 'VENDOR_SCAN_BATCHES.json')
writeFileSync(
  outPath,
  JSON.stringify({ generated: new Date().toISOString(), totalUniqueUrls: list.length, batches }, null, 2),
  'utf8'
)
console.log('Wrote', outPath, 'unique', list.length, 'batch sizes', batches.map((b) => b.length))
