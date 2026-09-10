import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing Supabase admin env')
  process.exit(1)
}

const USERNAME = 'charmed'
const PASSWORD = 'Charmed27Spiral!'
const EMAIL = 'charmedreg@br.org'
const ORG_NAME = 'Charmed'
const ORG_SLUG = 'charmed'
const EVENT_SLUG = 'charmed'
const CONVENTION_SLUG = 'charmed'
const WEBSITE = 'https://charmedhypno.org/'
const LOGO = '/images/charmed.png'

const ORG_DESCRIPTION = `Charmed! produces the Mid-Atlantic erotic, recreational, and educational hypnosis convention.

Charmed! 2027 is January 14–17, 2027 (MLK weekend) in Maryland, as a hybrid in-person and online event. The hotel name is shared at registration. Registration is through Black Rose; if that page is not accessible, email charmedreg@br.org.`

const admin = createClient(url, key, { auth: { persistSession: false } })
const now = new Date().toISOString()

async function findAuthUserByEmail(email) {
  const direct = admin.auth.admin.getUserByEmail
  if (typeof direct === 'function') {
    const { data, error } = await admin.auth.admin.getUserByEmail(email)
    if (!error && data?.user) return data.user
  }

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw new Error(`Could not list auth users: ${error.message}`)
    const match = data.users.find((row) => row.email?.toLowerCase() === email)
    if (match) return match
    if (!data.users.length || data.users.length < 200) return null
  }
  return null
}

async function ensureAuthUser() {
  const { data: existingOrg, error: orgLookupError } = await admin
    .from('organizations')
    .select('id, name, slug, username, email, owner_user_id')
    .eq('username', USERNAME)
    .maybeSingle()
  if (orgLookupError) throw new Error(`Org lookup failed: ${orgLookupError.message}`)

  if (existingOrg?.owner_user_id) {
    const { error: metaError } = await admin.auth.admin.updateUserById(existingOrg.owner_user_id, {
      email_confirm: true,
      app_metadata: { ecke_role: 'org', organization_id: existingOrg.id },
    })
    if (metaError) console.warn('app_metadata update failed:', metaError.message)
    return { userId: existingOrg.owner_user_id, org: existingOrg, created: false, passwordReset: false }
  }

  let user = await findAuthUserByEmail(EMAIL)
  let createdUser = false

  if (user) {
    const { data: otherOrg } = await admin
      .from('organizations')
      .select('id, name, username')
      .eq('owner_user_id', user.id)
      .maybeSingle()
    if (otherOrg && otherOrg.username !== USERNAME) {
      throw new Error(`Auth email ${EMAIL} already owns org ${otherOrg.username || otherOrg.id}`)
    }
    const { error: pwError } = await admin.auth.admin.updateUserById(user.id, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { name: ORG_NAME },
    })
    if (pwError) throw new Error(`Could not set password for existing auth email: ${pwError.message}`)
  } else {
    const created = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { name: ORG_NAME },
    })
    user = created.data?.user ?? null
    if (!user) throw new Error(`Could not create auth user: ${created.error?.message || 'unknown'}`)
    createdUser = true
  }

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name: ORG_NAME,
      slug: ORG_SLUG,
      email: EMAIL,
      website: WEBSITE,
      description: ORG_DESCRIPTION,
      logo_url: LOGO,
      username: USERNAME,
      owner_user_id: user.id,
    })
    .select('id, name, slug, username, email, owner_user_id')
    .single()

  if (orgError || !org) {
    if (createdUser) await admin.auth.admin.deleteUser(user.id)
    throw new Error(`Could not create organization: ${orgError?.message || 'unknown'}`)
  }

  const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(user.app_metadata ?? {}),
      ecke_role: 'org',
      organization_id: org.id,
    },
  })
  if (metaError) console.warn('app_metadata update failed:', metaError.message)

  return { userId: user.id, org, created: true, passwordReset: true }
}

async function upsertListing(table, matchSlug, row) {
  const { data: existing } = await admin.from(table).select('id, c2k_source_id').eq('slug', matchSlug).maybeSingle()
  if (existing?.id) {
    const { c2k_source_id: _freshId, ...updateRow } = row
    const { error } = await admin.from(table).update(updateRow).eq('id', existing.id)
    if (error) throw new Error(`Failed to update ${table}: ${error.message}`)
    return existing.id
  }
  const { data, error } = await admin.from(table).insert(row).select('id').single()
  if (error || !data) throw new Error(`Failed to insert ${table}: ${error?.message || 'unknown'}`)
  return data.id
}

const { org, created, passwordReset } = await ensureAuthUser()

const { error: orgUpdateError } = await admin
  .from('organizations')
  .update({
    name: ORG_NAME,
    slug: ORG_SLUG,
    email: EMAIL,
    website: WEBSITE,
    description: ORG_DESCRIPTION,
    logo_url: LOGO,
    username: USERNAME,
  })
  .eq('id', org.id)
if (orgUpdateError) throw new Error(`Org profile update failed: ${orgUpdateError.message}`)

const orgListingId = await upsertListing('organization_listings', ORG_SLUG, {
  slug: ORG_SLUG,
  name: 'Charmed!',
  description: ORG_DESCRIPTION,
  public_location_summary: 'Maryland · Mid-Atlantic hypnosis convention',
  logo_url: LOGO,
  website_url: WEBSITE,
  cta_url: WEBSITE,
  kink_social_canonical_url: null,
  status: 'published',
  source_system: 'ecke',
  c2k_source_type: 'organization',
  c2k_source_id: randomUUID(),
  source_attribution: 'Official site',
  last_synced_at: now,
  updated_at: now,
})

const { error: conventionError } = await admin
  .from('convention_listings')
  .update({
    org_slug: ORG_SLUG,
    org_display_name: 'Charmed!',
    logo_url: LOGO,
    updated_at: now,
  })
  .eq('slug', CONVENTION_SLUG)
if (conventionError) throw new Error(`Convention org link failed: ${conventionError.message}`)

const { error: eventError } = await admin
  .from('events')
  .update({
    organization_id: org.id,
    organizer: ORG_NAME,
    organizer_name: ORG_NAME,
    organizer_website: WEBSITE,
    email: EMAIL,
    logo: LOGO,
  })
  .eq('slug', EVENT_SLUG)
if (eventError) throw new Error(`Event org link failed: ${eventError.message}`)

if (passwordReset) {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!anon) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY for login verify')
  const verify = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: signedIn, error: signInError } = await verify.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  })
  if (signInError || !signedIn.user) {
    throw new Error(`Login verify failed: ${signInError?.message || 'unknown'}`)
  }
  await verify.auth.signOut()
}

console.log(
  JSON.stringify(
    {
      created,
      passwordReset,
      organizationId: org.id,
      username: USERNAME,
      email: EMAIL,
      orgListingId,
      pages: {
        organization: `/organizations/${ORG_SLUG}`,
        convention: `/conventions/${CONVENTION_SLUG}`,
        event: `/events/${EVENT_SLUG}`,
        edit: `/events/${EVENT_SLUG}/edit`,
        login: '/auth/org/login',
      },
    },
    null,
    2,
  ),
)
