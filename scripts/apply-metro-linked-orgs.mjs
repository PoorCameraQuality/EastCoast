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

const sinnErgyId = await upsertListing('organization_listings', 'sinn-ergy', {
  slug: 'sinn-ergy',
  name: 'Sinn-Ergy',
  description:
    'Sinn-Ergy hosts members-only lifestyle parties in the Washington, D.C. area for couples and invited single women. Founded in 2008. Upcoming dates are posted on sinn-ergy.com. Contact party@sinn-ergy.com.',
  public_location_summary: 'Washington, D.C. and surrounding areas',
  logo_url: '/images/sinn-ergy.webp',
  website_url: 'https://www.sinn-ergy.com/',
  cta_url: 'https://www.sinn-ergy.com/events',
  kink_social_canonical_url: null,
  status: 'published',
  source_system: 'ecke',
  c2k_source_type: 'organization',
  c2k_source_id: randomUUID(),
  source_attribution: 'Official site',
  last_synced_at: now,
  updated_at: now,
})

const masqueId = await upsertListing('organization_listings', 'masque', {
  slug: 'masque',
  name: 'Masqué',
  description:
    'Masqué produces selective private nights in Washington, D.C. built around music, atmosphere, and discretionary social space. Upcoming 2026 dates include Black Swan Theory on September 26 and Obsession on December 5. Request access on masque.co.',
  public_location_summary: 'Washington, D.C.',
  logo_url: '/images/masque.png',
  website_url: 'https://masque.co/',
  cta_url: 'https://masque.co/all-events/',
  kink_social_canonical_url: null,
  status: 'published',
  source_system: 'ecke',
  c2k_source_type: 'organization',
  c2k_source_id: randomUUID(),
  source_attribution: 'Official site',
  last_synced_at: now,
  updated_at: now,
})

const mastId = await upsertListing('group_listings', 'mast-washington', {
  slug: 'mast-washington',
  name: 'MAsT Washington',
  description:
    'MAsT Washington is the D.C. chapter of Masters And slaves Together, founded in 1999. Meetings are the second Tuesday of each month at 7:30 PM and have been virtual since April 2020. Open to male Masters and slaves of any sexual orientation and male-identified trans attendees. No membership fee. Contact info@mastwashington.org.',
  public_location_summary: 'Washington, D.C. (virtual meetings)',
  tags: ['bdsm', 'education', 'ms', 'leather'],
  logo_url: '/images/mast-washington.png',
  cta_url: 'http://www.mastwashington.org/',
  kink_social_canonical_url: null,
  org_slug: null,
  org_display_name: 'MAsT Washington',
  status: 'published',
  source_system: 'ecke',
  c2k_source_type: 'group',
  c2k_source_id: randomUUID(),
  source_attribution: 'Official site',
  last_synced_at: now,
  updated_at: now,
})

const dcFetishId = await upsertEvent('dc-fetish-ball', {
  title: 'DC Fetish Ball',
  start_date: '2026-10-11',
  end_date: '2026-10-11',
  display_date: 'Oct 11, 2026',
  city: 'Washington',
  state: 'DC',
  venue: 'UltraBar, 911 F St NW, Washington, DC',
  short_description:
    'DC Fetish Ball returns Sunday, October 11, 2026 at UltraBar. Richard A.D and Metro Underground’s 18th-year fetish ball. 21+, strict dress code. Presale through the official tickets page.',
  website: 'https://www.dcfetishball.com/',
  ticket_url: 'https://www.dcfetishball.com/tickets',
  email: 'richardad2000@gmail.com',
  organizer: 'Metro Underground',
  organizer_name: 'Metro Underground',
  category: 'Convention',
  event_type: 'social',
  logo: '/images/events/brand-event-dc-fetish-ball.svg',
  status: 'published',
  registration_required: true,
})

const blackSwanId = await upsertEvent('masque-black-swan-2026', {
  title: 'Masqué: Black Swan Theory',
  start_date: '2026-09-26',
  end_date: '2026-09-26',
  display_date: 'Sep 26, 2026',
  city: 'Washington',
  state: 'DC',
  venue: 'Washington, D.C. (venue shared with members)',
  short_description:
    'Masqué : Atelier — Black Swan Theory. A selective multi-level night in Washington, D.C. on September 26, 2026. Request access on masque.co.',
  long_description:
    'Masqué : Atelier returns September 26, 2026 in Washington, D.C. Official copy describes a multi-level night of music, performance, and late-night movement. Entry is selective. Request access or membership on masque.co.',
  website: 'https://masque.co/events/black-swan-theory/',
  ticket_url: 'https://masque.co/events/black-swan-theory/',
  email: 'hello@masque.co',
  organizer: 'Masqué',
  organizer_name: 'Masqué',
  category: 'Social',
  event_type: 'social',
  logo: '/images/masque.png',
  status: 'published',
  show_address_publicly: false,
  registration_required: true,
})

const obsessionId = await upsertEvent('masque-obsession-2026', {
  title: 'Masqué: Obsession',
  start_date: '2026-12-05',
  end_date: '2026-12-05',
  display_date: 'Dec 5, 2026',
  city: 'Washington',
  state: 'DC',
  venue: 'Washington, D.C. (venue shared with members)',
  short_description:
    'Masqué : Atelier — Obsession. A selective night in Washington, D.C. on December 5, 2026. Dates and access are on masque.co.',
  website: 'https://masque.co/all-events/',
  ticket_url: 'https://masque.co/all-events/',
  email: 'hello@masque.co',
  organizer: 'Masqué',
  organizer_name: 'Masqué',
  category: 'Social',
  event_type: 'social',
  logo: '/images/masque.png',
  status: 'published',
  show_address_publicly: false,
  registration_required: true,
})

console.log(
  JSON.stringify(
    {
      listings: {
        sinnErgy: { id: sinnErgyId, path: '/organizations/sinn-ergy' },
        masque: { id: masqueId, path: '/organizations/masque' },
        mastWashington: { id: mastId, path: '/groups/mast-washington' },
      },
      events: {
        dcFetishBall: { id: dcFetishId, path: '/events/dc-fetish-ball' },
        masqueBlackSwan: { id: blackSwanId, path: '/events/masque-black-swan-2026' },
        masqueObsession: { id: obsessionId, path: '/events/masque-obsession-2026' },
      },
    },
    null,
    2,
  ),
)
