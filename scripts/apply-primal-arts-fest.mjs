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

const USERNAME = (process.env.PAF_USERNAME || 'primalartsfest').trim().toLowerCase()
const PASSWORD = process.env.PAF_PASSWORD || 'Paf27EmberGrove!'
const EMAIL = (process.env.PAF_EMAIL || 'primalartsfirefest@gmail.com').trim().toLowerCase()
const ORG_NAME = 'Primal Arts Fest'
const ORG_SLUG = 'primal-arts-fest'
const EVENT_SLUG = 'primal-arts-festival'
const CONVENTION_SLUG = 'paf27'
const WEBSITE = 'https://www.primalartsfest.com/'
const LOGO = '/images/primalarts.png'

const ORG_DESCRIPTION = `Primal Arts Fest produces PAF, a four-day, 21+ clothing-optional gathering that blends fire, ritual, art, education, and primal expression.

By connecting body and spirit, provoking spiritual evolution, and embracing the sacred and the profane, the gathering invites participants to explore workshops, performances, sacred sexuality, kink, and body modification. It is built on consent, inclusivity, and risk-aware practices, with rituals, workshops, play-spaces, music, and artisanal markets on a 200-acre campground in Darlington, Maryland.`

const CONVENTION_DESCRIPTION = `PAF27 returns May 5–9, 2027.

Primal Arts Fest is a four-day, 21+ clothing-optional gathering that blends fire, ritual, art, education, and primal expression. Participants explore workshops, performances, sacred sexuality, kink, and body modification on a private 200-acre campground in Darlington, Maryland. The campground address is shared with registered attendees.

Join the mailing list on the official site for registration updates. Vendor and body-modification artist applications open late summer 2026.`

const LONG_DESCRIPTION = `PAF27 returns May 5–9, 2027. Primal Arts Fest is a four-day, 21+ clothing-optional gathering that blends fire, ritual, art, education, and primal expression.

By connecting body and spirit, provoking spiritual evolution, and embracing the sacred and the profane, it invites participants to explore workshops, performances, sacred sexuality, kink, and body modification. Built on consent, inclusivity, and risk-aware practices, the festival offers rituals, workshops, play-spaces, music, artisanal markets, and more — all with the backdrop of a 200-acre campground.

For as long as humans have circled firelight and followed the drum, we have sought what lies beyond the everyday. Here, the arts of fire, ink, and ordeal are not spectacle but offering. Music becomes invocation, skin becomes canvas, and the body becomes a temple of both the sacred and the profane.

**Venue:** Private 200-acre campground in Darlington, Maryland. Address is shared with registered attendees.

**Registration:** Join the mailing list on the official site for PAF27 updates, pre-sale access, and rates. Ticket sales are announced there.

**Get involved:** Staff, volunteer, presenter, and performer roles are listed on the official site. Vendor and body-modification artist applications open late summer 2026.`

const FEATURES = JSON.stringify([
  'PAF27 · May 5–9, 2027',
  'Darlington, Maryland campground',
  '21+ clothing-optional gathering',
  'Fire, ritual, art, and education',
  'Workshops and performances',
  'Sacred sexuality and kink',
  'Body modification arts',
  'Play-spaces and music',
  'Artisanal vendor market',
  'Consent, inclusivity, and risk-aware practice',
])

const admin = createClient(url, key, { auth: { persistSession: false } })
const now = new Date().toISOString()

async function ensureAuthUser() {
  const { data: existingOrg } = await admin
    .from('organizations')
    .select('id, name, slug, username, email, owner_user_id')
    .eq('username', USERNAME)
    .maybeSingle()

  if (existingOrg?.owner_user_id) {
    const { error: pwError } = await admin.auth.admin.updateUserById(existingOrg.owner_user_id, {
      password: PASSWORD,
      email: EMAIL,
      email_confirm: true,
      app_metadata: { ecke_role: 'org', organization_id: existingOrg.id },
    })
    if (pwError) throw new Error(`Could not reset organizer password: ${pwError.message}`)
    return { userId: existingOrg.owner_user_id, org: existingOrg, created: false }
  }

  const created = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: ORG_NAME },
  })

  let user = created.data?.user ?? null
  let reusedAuthUser = false
  if (!user && created.error && /already|registered|exists/i.test(created.error.message)) {
    const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (listError) throw new Error(`Could not look up existing auth user: ${listError.message}`)
    user = listed.users.find((row) => row.email?.toLowerCase() === EMAIL) ?? null
    if (!user) throw new Error(`Auth email already exists but user was not found: ${EMAIL}`)
    const { error: pwError } = await admin.auth.admin.updateUserById(user.id, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { name: ORG_NAME },
    })
    if (pwError) throw new Error(`Could not reset existing auth user: ${pwError.message}`)
    reusedAuthUser = true
  }
  if (!user) {
    throw new Error(`Could not create auth user: ${created.error?.message || 'unknown'}`)
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
    if (!reusedAuthUser) await admin.auth.admin.deleteUser(user.id)
    throw new Error(`Could not create organization: ${orgError?.message || 'unknown'}`)
  }

  const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(user.app_metadata ?? {}),
      ecke_role: 'org',
      organization_id: org.id,
    },
  })
  if (metaError) {
    console.warn('app_metadata update failed:', metaError.message)
  }

  return { userId: user.id, org, created: true }
}

async function upsertListing(table, matchSlug, row) {
  const { data: existing } = await admin
    .from(table)
    .select('id, c2k_source_id')
    .eq('slug', matchSlug)
    .maybeSingle()
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

const { org, created } = await ensureAuthUser()

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
  name: ORG_NAME,
  description: ORG_DESCRIPTION,
  public_location_summary: 'Darlington, Maryland',
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

const conventionListingId = await upsertListing('convention_listings', CONVENTION_SLUG, {
  slug: CONVENTION_SLUG,
  name: 'Primal Arts Fest 2027 (PAF27)',
  description: CONVENTION_DESCRIPTION,
  public_location_summary: 'Darlington, Maryland · May 5–9, 2027',
  logo_url: LOGO,
  cta_url: WEBSITE,
  kink_social_canonical_url: null,
  org_slug: ORG_SLUG,
  org_display_name: ORG_NAME,
  starts_at: '2027-05-05T00:00:00-04:00',
  ends_at: '2027-05-09T23:59:59-04:00',
  status: 'published',
  source_system: 'ecke',
  c2k_source_type: 'convention',
  c2k_source_id: randomUUID(),
  source_attribution: 'Official site',
  last_synced_at: now,
  updated_at: now,
})

const { error: eventError } = await admin
  .from('events')
  .update({
    title: 'Primal Arts Fest',
    short_title: 'PAF27',
    start_date: '2027-05-05',
    end_date: '2027-05-09',
    display_date: 'May 5-9, 2027',
    city: 'Darlington',
    state: 'MD',
    venue: '200-acre private campground',
    short_description:
      'PAF27 returns May 5–9, 2027. Primal Arts Fest is a four-day, 21+ clothing-optional gathering in Darlington, Maryland that blends fire, ritual, art, education, and primal expression.',
    long_description: LONG_DESCRIPTION,
    seo_description:
      'PAF27 returns May 5–9, 2027 in Darlington, MD. A four-day, 21+ clothing-optional gathering of fire, ritual, art, education, and primal expression.',
    seo_title: 'Primal Arts Fest 2027 (PAF27): Maryland Campground Gathering',
    seo_keywords: [
      'Primal Arts Fest 2027',
      'PAF27',
      'Darlington',
      'Maryland',
      'sacred sexuality',
      'kink',
      'camping festival',
    ],
    category: 'Convention',
    event_type: 'convention',
    features: FEATURES,
    logo: LOGO,
    website: WEBSITE,
    email: EMAIL,
    organizer: ORG_NAME,
    organizer_name: ORG_NAME,
    organizer_website: WEBSITE,
    organization_id: org.id,
    status: 'published',
    age_restriction: '21+',
    dress_code: 'Clothing optional',
    hotel_information: '200-acre private campground, Darlington, MD (address shared with registrants)',
    show_address_publicly: false,
    ticket_url: WEBSITE,
    registration_required: true,
    staff_application_url: WEBSITE,
    presenter_application_url: WEBSITE,
    vendor_application_url: WEBSITE,
    staff_applications_open: true,
    presenter_applications_open: true,
    vendor_applications_open: false,
  })
  .eq('slug', EVENT_SLUG)

if (eventError) throw new Error(`Event update failed: ${eventError.message}`)

console.log(
  JSON.stringify(
    {
      created,
      organizationId: org.id,
      username: USERNAME,
      email: EMAIL,
      orgListingId,
      conventionListingId,
      pages: {
        organization: `/organizations/${ORG_SLUG}`,
        convention: `/conventions/${CONVENTION_SLUG}`,
        event: `/events/${EVENT_SLUG}`,
        login: '/auth/org/login',
      },
    },
    null,
    2,
  ),
)
