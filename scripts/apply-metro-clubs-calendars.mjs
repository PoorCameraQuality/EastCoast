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

const admin = createClient(url, key, { auth: { persistSession: false } })
const now = new Date().toISOString()

async function upsertListing(table, matchSlug, row) {
  const { data: existing } = await admin.from(table).select('id, c2k_source_id').eq('slug', matchSlug).maybeSingle()
  if (existing?.id) {
    const { c2k_source_id: _freshId, ...updateRow } = row
    const { error } = await admin.from(table).update(updateRow).eq('id', existing.id)
    if (error) throw new Error(`Failed to update ${table} ${matchSlug}: ${error.message}`)
    return existing.id
  }
  const { data, error } = await admin.from(table).insert(row).select('id').single()
  if (error || !data) throw new Error(`Failed to insert ${table} ${matchSlug}: ${error?.message || 'unknown'}`)
  return data.id
}

async function upsertEvent(slug, row) {
  const { data: existing } = await admin.from('events').select('id').eq('slug', slug).maybeSingle()
  if (existing?.id) {
    const { error } = await admin.from('events').update(row).eq('id', existing.id)
    if (error) throw new Error(`Failed to update event ${slug}: ${error.message}`)
    return existing.id
  }
  const { data, error } = await admin.from('events').insert({ slug, ...row }).select('id').single()
  if (error || !data) throw new Error(`Failed to insert event ${slug}: ${error?.message || 'unknown'}`)
  return data.id
}

const frictionId = await upsertListing('organization_listings', 'friction-parties', {
  slug: 'friction-parties',
  name: 'Friction Parties',
  description:
    'Friction Parties hosts hotel and on-premise lifestyle events. Their public site lists Philadelphia, Raleigh, and Cleveland, and notes that most dates are visible only after registering. Monthly Club Friction on-premise nights are the exception. Confirm current cities and tickets on frictionparties.com.',
  public_location_summary: 'Philadelphia, Raleigh, Cleveland, and other cities',
  logo_url: null,
  website_url: 'https://www.frictionparties.com/',
  cta_url: 'https://www.frictionparties.com/',
  kink_social_canonical_url: null,
  status: 'published',
  source_system: 'ecke',
  c2k_source_type: 'organization',
  c2k_source_id: randomUUID(),
  source_attribution: 'Official site',
  last_synced_at: now,
  updated_at: now,
})

const splashId = await upsertListing('organization_listings', 'splash-takeovers', {
  slug: 'splash-takeovers',
  name: 'Splash Takeovers',
  description:
    'Splash Takeovers produces couples-only lifestyle hotel takeovers with pool time, seminars, dance parties, and play spaces including a dungeon. Event dates are behind member login on splashtakeovers.com.',
  public_location_summary: 'Couples-only hotel takeovers',
  logo_url: null,
  website_url: 'https://splashtakeovers.com/',
  cta_url: 'https://splashtakeovers.com/',
  kink_social_canonical_url: null,
  status: 'published',
  source_system: 'ecke',
  c2k_source_type: 'organization',
  c2k_source_id: randomUUID(),
  source_attribution: 'Official site',
  last_synced_at: now,
  updated_at: now,
})

const stimulateId = await upsertListing('organization_listings', 'stimulate', {
  slug: 'stimulate',
  name: 'STIMULATE',
  description:
    'STIMULATE is a New York fetish and alternative dance night, generally on third Fridays. The official 2026 calendar includes an 18-year anniversary on September 18 and the annual Halloween Ball on October 16. Tickets and RSVP are on stimulate-me.com.',
  public_location_summary: 'Brooklyn, New York',
  logo_url: '/images/stimulate.png',
  website_url: 'https://stimulate-me.com/',
  cta_url: 'https://stimulate-me.com/tickets/',
  kink_social_canonical_url: null,
  status: 'published',
  source_system: 'ecke',
  c2k_source_type: 'organization',
  c2k_source_id: randomUUID(),
  source_attribution: 'Official site',
  last_synced_at: now,
  updated_at: now,
})

const cuffId = await upsertListing('group_listings', 'cuff-charlottesville', {
  slug: 'cuff-charlottesville',
  name: 'CUFF / Charlottesville Underground Fetish Fellowship',
  description:
    'CUFF is a pansexual BDSM social and support organization based in Charlottesville, Virginia. The official site is cuff-va.com. Inner pages and event details often point to FetLife or older group hosts, so confirm current meetings there.',
  public_location_summary: 'Charlottesville, Virginia',
  tags: ['bdsm', 'education', 'fetish'],
  logo_url: '/images/cuff-va.png',
  cta_url: 'https://www.cuff-va.com/',
  kink_social_canonical_url: null,
  org_slug: null,
  org_display_name: 'CUFF',
  status: 'published',
  source_system: 'ecke',
  c2k_source_type: 'group',
  c2k_source_id: randomUUID(),
  source_attribution: 'Official site',
  last_synced_at: now,
  updated_at: now,
})

const anniversaryId = await upsertEvent('stimulate-anniversary-2026', {
  title: 'STIMULATE 18 Year Anniversary',
  start_date: '2026-09-18',
  end_date: '2026-09-18',
  display_date: 'Sep 18, 2026',
  city: 'Brooklyn',
  state: 'NY',
  venue: 'The Brooklyn Monarch (Wood Shop), 23 Meadow St, Brooklyn, NY 11206',
  short_description:
    'STIMULATE’s 18-year anniversary on September 18, 2026 at The Brooklyn Monarch. 10:30pm–4:00am. Tickets on stimulate-me.com.',
  website: 'https://stimulate-me.com/',
  ticket_url: 'https://stimulate-me.com/tickets/',
  organizer: 'STIMULATE',
  organizer_name: 'STIMULATE',
  category: 'Social',
  event_type: 'social',
  logo: '/images/stimulate.png',
  status: 'published',
  registration_required: true,
})

const halloweenId = await upsertEvent('stimulate-halloween-ball-2026', {
  title: 'STIMULATE Halloween Ball',
  start_date: '2026-10-16',
  end_date: '2026-10-16',
  display_date: 'Oct 16, 2026',
  city: 'Brooklyn',
  state: 'NY',
  venue: 'Confirm venue on stimulate-me.com',
  short_description:
    'STIMULATE’s annual Halloween Ball on October 16, 2026, featuring Ayria and Noir per the official tickets page. Confirm venue and tickets on stimulate-me.com.',
  website: 'https://stimulate-me.com/',
  ticket_url: 'https://stimulate-me.com/tickets/',
  organizer: 'STIMULATE',
  organizer_name: 'STIMULATE',
  category: 'Social',
  event_type: 'social',
  logo: '/images/stimulate.png',
  status: 'published',
  show_address_publicly: false,
  registration_required: true,
})

console.log(
  JSON.stringify(
    {
      listings: {
        frictionParties: { id: frictionId, path: '/organizations/friction-parties' },
        splashTakeovers: { id: splashId, path: '/organizations/splash-takeovers' },
        stimulate: { id: stimulateId, path: '/organizations/stimulate' },
        cuff: { id: cuffId, path: '/groups/cuff-charlottesville' },
      },
      events: {
        stimulateAnniversary: { id: anniversaryId, path: '/events/stimulate-anniversary-2026' },
        stimulateHalloween: { id: halloweenId, path: '/events/stimulate-halloween-ball-2026' },
      },
    },
    null,
    2,
  ),
)
