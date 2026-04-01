import { getAllSwingClubs } from '../src/data/swingClubs.js'

const base = process.argv[2] || 'http://localhost:3000'
for (const c of getAllSwingClubs()) {
  console.log(`${base}/swing-clubs/${c.slug}`)
}
