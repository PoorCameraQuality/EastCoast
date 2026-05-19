#!/usr/bin/env node
/**
 * One-time copy of objects from the legacy bucket (default dancecard-maps) into split buckets.
 * Does not delete source objects. Safe to re-run (upsert).
 *
 *   npm run dancecard:migrate-storage
 *   npm run dancecard:migrate-storage -- --dry-run
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
config({ path: path.join(root, '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const dryRun = process.argv.includes('--dry-run')
const legacyBucket = process.env.DANCECARD_LEGACY_STORAGE_BUCKET ?? process.env.DANCECARD_MAPS_BUCKET ?? 'dancecard-maps'
const mapsBucket = process.env.DANCECARD_MAPS_BUCKET ?? 'dancecard-maps'
const eventAssetsBucket = process.env.DANCECARD_EVENT_ASSETS_BUCKET ?? 'dancecard-event-assets'
const profileBucket = process.env.DANCECARD_PROFILE_PHOTOS_BUCKET ?? 'dancecard-profile-photos'

const supabase = createClient(url, key, { auth: { persistSession: false } })

function targetBucket(objectPath) {
  if (objectPath.includes('/profile-photos/')) return profileBucket
  if (objectPath.includes('badge-logo')) return eventAssetsBucket
  return null
}

async function listAllObjects(bucket, prefix = '') {
  const out = []
  let offset = 0
  const limit = 100
  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (error) throw error
    if (!data?.length) break
    for (const item of data) {
      const name = item.name
      if (!name) continue
      const fullPath = prefix ? `${prefix}/${name}` : name
      if (item.id == null && item.metadata == null) {
        const nested = await listAllObjects(bucket, fullPath)
        out.push(...nested)
      } else {
        out.push(fullPath)
      }
    }
    if (data.length < limit) break
    offset += limit
  }
  return out
}

async function copyObject(fromBucket, toBucket, objectPath) {
  const { data: blob, error: dlErr } = await supabase.storage.from(fromBucket).download(objectPath)
  if (dlErr || !blob) {
    throw new Error(`download ${fromBucket}/${objectPath}: ${dlErr?.message ?? 'no data'}`)
  }
  const buf = Buffer.from(await blob.arrayBuffer())
  const { error: upErr } = await supabase.storage.from(toBucket).upload(objectPath, buf, {
    upsert: true,
    contentType: blob.type || undefined,
  })
  if (upErr) throw new Error(`upload ${toBucket}/${objectPath}: ${upErr.message}`)
}

async function main() {
  console.log('Legacy source bucket:', legacyBucket)
  console.log('Targets:', { profile: profileBucket, eventAssets: eventAssetsBucket })
  console.log('Maps stay in:', mapsBucket, '(not moved)')
  if (dryRun) console.log('DRY RUN — no copies\n')

  const objects = await listAllObjects(legacyBucket)
  const toMigrate = objects
    .map((p) => ({ path: p, bucket: targetBucket(p) }))
    .filter((x) => x.bucket && x.bucket !== legacyBucket)

  if (!toMigrate.length) {
    console.log('No profile-photo or badge-logo objects found in legacy bucket.')
    return
  }

  let ok = 0
  let fail = 0
  for (const { path: objectPath, bucket } of toMigrate) {
    try {
      if (dryRun) {
        console.log(`[dry-run] ${legacyBucket}/${objectPath} -> ${bucket}/${objectPath}`)
      } else {
        await copyObject(legacyBucket, bucket, objectPath)
        console.log(`Copied ${objectPath} -> ${bucket}`)
      }
      ok++
    } catch (e) {
      console.error(`FAIL ${objectPath}:`, e instanceof Error ? e.message : e)
      fail++
    }
  }

  console.log(`\nDone. ${ok} ok, ${fail} failed, ${objects.length - toMigrate.length} map objects left in ${legacyBucket}.`)
  if (!dryRun && fail === 0) {
    console.log('\nCreate the new buckets in Supabase if you have not already:')
    console.log(' -', profileBucket)
    console.log(' -', eventAssetsBucket)
    console.log(' -', mapsBucket, '(maps only)')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
