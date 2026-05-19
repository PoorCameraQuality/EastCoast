import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
config({ path: path.join(root, '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.DANCECARD_PROFILE_PHOTOS_BUCKET ?? 'dancecard-profile-photos'

if (!url || !key) {
  console.error('Missing Supabase env')
  process.exit(1)
}

const supabase = createClient(url, key)
const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const objectPath = `test-upload-probe/profile-photos/probe-id/test.png`

const up = await supabase.storage.from(bucket).upload(objectPath, buf, {
  contentType: 'image/png',
  upsert: true,
})
console.log('upload:', up.error?.message ?? 'ok', up.data?.path)

const sign = await supabase.storage.from(bucket).createSignedUrl(objectPath, 3600)
console.log('sign:', sign.error?.message ?? sign.data?.signedUrl?.slice(0, 80))

const list = await supabase.storage.listBuckets()
console.log(
  'buckets:',
  (list.data ?? []).map((b) => b.name).filter((n) => n.includes('dancecard')),
)
