import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
config({ path: path.join(root, '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing env')
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false } })
const slug = 'sandbox'

const { data: event, error: evErr } = await admin
  .from('dancecard_events')
  .select('id, slug, status, attendee_profile_config')
  .eq('slug', slug)
  .maybeSingle()
console.log('event', evErr?.message ?? event?.id, event?.status)

const { data: acc } = await admin
  .from('dancecard_accounts')
  .select('id, username, display_name')
  .eq('event_id', event?.id)
  .limit(1)
  .maybeSingle()
console.log('account', acc?.username)

if (!event?.id || !acc?.id) process.exit(1)

const bucket = process.env.DANCECARD_PROFILE_PHOTOS_BUCKET ?? 'dancecard-profile-photos'
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const objectPath = `${event.id}/profile-photos/${acc.id}/probe-flow.png`

const up = await admin.storage.from(bucket).upload(objectPath, png, {
  contentType: 'image/png',
  upsert: true,
})
console.log('upload', up.error?.message ?? 'ok')

const photoRef = `storage:${objectPath}`
const { data: prefsRow, error: pErr } = await admin
  .from('dancecard_prefs')
  .select('profile_json')
  .eq('account_id', acc.id)
  .maybeSingle()
console.log('prefs load', pErr?.message ?? 'ok', typeof prefsRow?.profile_json)

const merged = { ...(prefsRow?.profile_json && typeof prefsRow.profile_json === 'object' ? prefsRow.profile_json : {}), photoUrl: photoRef }
const { error: saveErr } = await admin
  .from('dancecard_prefs')
  .update({ profile_json: merged, updated_at: new Date().toISOString() })
  .eq('account_id', acc.id)
console.log('prefs save', saveErr?.message ?? 'ok')

const sign = await admin.storage.from(bucket).createSignedUrl(objectPath, 3600)
console.log('sign', sign.error?.message ?? 'ok')
