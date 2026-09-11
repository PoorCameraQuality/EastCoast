/**
 * Rename Floggin Farmers → Flogging Farmers (slug/username/URLs).
 * Etsy shop handle stays https://www.etsy.com/shop/FlogginFarmers
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing Supabase env')
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false } })

const OLD_SLUG = 'floggin-farmers'
const NEW_SLUG = 'flogging-farmers'
const OLD_USER = 'flogginfarmers'
const NEW_USER = 'floggingfarmers'
const OLD_EMAIL = 'flogginfarmers@eastcoastkinkevents.com'
const NEW_EMAIL = 'floggingfarmers@eastcoastkinkevents.com'
const NEW_PASSWORD = 'Floggingfarmers26!'
const ETSY = 'https://www.etsy.com/shop/FlogginFarmers'
const CSV_PATH = resolve('C:/Users/shkin/Desktop/vendor-org-logins.csv')

async function findAuthUserByEmail(email) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (match) return match
    if (!data.users.length || data.users.length < 200) return null
  }
  return null
}

function rewriteLogo(path) {
  if (!path) return path
  return String(path).replaceAll(`/images/vendors/${OLD_SLUG}/`, `/images/vendors/${NEW_SLUG}/`)
}

const { data: vendor, error: vErr } = await admin
  .from('vendors')
  .select('*')
  .eq('slug', OLD_SLUG)
  .maybeSingle()
if (vErr) throw vErr
if (!vendor) {
  const { data: already } = await admin.from('vendors').select('slug,name').eq('slug', NEW_SLUG).maybeSingle()
  if (already) console.log('Vendor already renamed:', already)
  else {
    console.error('Vendor not found for', OLD_SLUG)
    process.exit(1)
  }
} else {
  const { error } = await admin
    .from('vendors')
    .update({
      slug: NEW_SLUG,
      name: 'Flogging Farmers',
      logo_url: rewriteLogo(vendor.logo_url),
      website_url: ETSY,
      updated_at: new Date().toISOString(),
    })
    .eq('id', vendor.id)
  if (error) throw error
  console.log('vendors.slug', OLD_SLUG, '→', NEW_SLUG)
}

const { data: org, error: oErr } = await admin
  .from('organizations')
  .select('*')
  .or(`slug.eq.${OLD_SLUG},username.eq.${OLD_USER}`)
  .maybeSingle()
if (oErr) throw oErr

let ownerId = org?.owner_user_id || null
if (org) {
  const { error } = await admin
    .from('organizations')
    .update({
      slug: NEW_SLUG,
      username: NEW_USER,
      email: NEW_EMAIL,
      name: 'Flogging Farmers',
      logo_url: rewriteLogo(org.logo_url),
      website: ETSY,
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id)
  if (error) throw error
  console.log('organizations', org.slug, '/', org.username, '→', NEW_SLUG, '/', NEW_USER)
  ownerId = org.owner_user_id
}

const { data: listing, error: lErr } = await admin
  .from('organization_listings')
  .select('*')
  .eq('slug', OLD_SLUG)
  .maybeSingle()
if (lErr) throw lErr
if (listing) {
  const { error } = await admin
    .from('organization_listings')
    .update({
      slug: NEW_SLUG,
      name: 'Flogging Farmers',
      logo_url: rewriteLogo(listing.logo_url),
      website_url: listing.website_url || ETSY,
      cta_url: `https://eastcoastkinkevents.com/vendors/${NEW_SLUG}`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listing.id)
  if (error) throw error
  console.log('organization_listings.slug', OLD_SLUG, '→', NEW_SLUG)
}

let authUser = ownerId
  ? (await admin.auth.admin.getUserById(ownerId)).data.user
  : null
if (!authUser) authUser = await findAuthUserByEmail(OLD_EMAIL)
if (!authUser) authUser = await findAuthUserByEmail(NEW_EMAIL)

if (authUser) {
  const { error } = await admin.auth.admin.updateUserById(authUser.id, {
    email: NEW_EMAIL,
    password: NEW_PASSWORD,
    email_confirm: true,
    user_metadata: {
      ...(authUser.user_metadata || {}),
      username: NEW_USER,
      org_slug: NEW_SLUG,
    },
  })
  if (error) throw error
  console.log('auth user email/password updated →', NEW_EMAIL)
} else {
  console.warn('No auth user found to update')
}

// CSV
const csv = readFileSync(CSV_PATH, 'utf8')
const lines = csv.split(/\r?\n/)
const header = lines[0]
const out = lines.map((line, i) => {
  if (i === 0 || !line.includes('floggin')) return line
  return [
    'Flogging Farmers',
    NEW_SLUG,
    NEW_USER,
    NEW_PASSWORD,
    NEW_EMAIL,
    '',
    '',
    ETSY,
    ETSY,
    'no published email found; use website',
    'website-only',
    NEW_SLUG,
    `https://eastcoastkinkevents.com/vendors/${NEW_SLUG}`,
    `https://eastcoastkinkevents.com/organizations/${NEW_SLUG}`,
    'https://eastcoastkinkevents.com/auth/org/login',
    'https://eastcoastkinkevents.com/vendors/my-shop',
    'updated',
    'Renamed floggin→flogging; password reset; Etsy handle unchanged',
  ].join(',')
})
writeFileSync(CSV_PATH, out.join('\n'), 'utf8')
console.log('CSV updated', CSV_PATH)
console.log('Header check:', header.slice(0, 80))
