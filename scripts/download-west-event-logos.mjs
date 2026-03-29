/**
 * One-off: fetch western con logos where shell quoting is awkward.
 *   node scripts/download-west-event-logos.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const destDir = join(__dirname, '..', 'public', 'images', 'events')
mkdirSync(destDir, { recursive: true })

/** Use `-b` suffix if a previous partial download left locked zero-byte files on Windows. */
const jobs = [
  {
    url: 'https://static1.squarespace.com/static/66d8a72434836f0eddc58239/t/66e22024819561631a5adbc4/1726095396280/new+NWLC+Logo.png?format=500w',
    file: 'logo-northwest-leather-celebration-2026-b.png',
  },
  {
    url: 'https://images.squarespace-cdn.com/content/v1/673284b7764c801b6b6e6115/b4e13145-4b7b-4a83-b1c3-a3cb92e87319/Clear+LLC+Logo.jpg?format=500w',
    file: 'logo-leather-leadership-conference-2026-b.jpg',
  },
  {
    url: 'https://static.wixstatic.com/media/d3d593_aa483bd734c245df8cc071eb15b8e24f~mv2.jpg/v1/fill/w_400,h_225,al_c,q_80,usm_0.66_1.00_0.01/d3d593_aa483bd734c245df8cc071eb15b8e24f~mv2.jpg',
    file: 'logo-rgv-leather-weekend-2026-b.jpg',
  },
  {
    url: 'https://sdbbleather.com/wp-content/uploads/2025/01/SD-Bootblack-Leather-Logo.svg',
    file: 'logo-san-diego-bootblack-leather-2026-b.svg',
  },
]

for (const { url, file } of jobs) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ECKE-bot/1.0)' },
  })
  if (!res.ok) {
    console.error('FAIL', file, res.status, url)
    continue
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const finalPath = join(destDir, file)
  writeFileSync(finalPath, buf)
  console.log('OK', file, buf.length)
}
