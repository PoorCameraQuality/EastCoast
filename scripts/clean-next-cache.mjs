#!/usr/bin/env node
/**
 * Remove Next.js / webpack build caches (fixes missing chunk errors like ./8948.js).
 */
import { rmSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const targets = [
  join(root, '.next'),
  join(root, '.turbo'),
  join(root, 'node_modules', '.cache'),
  join(root, 'projectfilesmigration', '.next'),
]

let removed = 0
for (const path of targets) {
  if (!existsSync(path)) continue
  rmSync(path, { recursive: true, force: true })
  console.log(`removed ${path}`)
  removed++
}

if (removed === 0) {
  console.log('no cache directories found (already clean)')
} else {
  console.log(`cleared ${removed} cache director${removed === 1 ? 'y' : 'ies'}`)
}
