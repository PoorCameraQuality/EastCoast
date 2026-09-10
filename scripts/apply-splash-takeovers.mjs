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
const ORG_SLUG = 'splash-takeovers'
const ORG_NAME = 'Splash Takeovers'
const EMAIL = 'info@splashtakeovers.com'
const LOGO = '/images/splash-takeovers.png'
const WEBSITE = 'https://splashtakeovers.com/'

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

const orgDescription = `Splash Takeovers produces couples-only lifestyle hotel-takeover conventions. The public site now lists three dated events: CouplesXcape 2026 (Ft. Lauderdale / South Florida, September 10–13, 2026), Xcapades 2027 (Houston, June 3–6, 2027), and EROTICON 2027 (Atlanta, August 5–8, 2027). Hotel names are withheld until a reservation is paid in full. Contact ${EMAIL}. Tickets and details are on splashtakeovers.com.`

const orgId = await upsertListing('organization_listings', ORG_SLUG, {
  slug: ORG_SLUG,
  name: ORG_NAME,
  description: orgDescription,
  public_location_summary: 'Couples-only hotel takeovers · Florida, Texas, Georgia',
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

const conventions = [
  {
    slug: 'couplesxcape-2026',
    title: 'CouplesXcape 2026',
    start: '2026-09-10',
    end: '2026-09-13',
    display: 'Sep 10–13, 2026',
    startsAt: '2026-09-10T13:30:00-04:00',
    endsAt: '2026-09-13T02:00:00-04:00',
    city: 'Ft. Lauderdale',
    state: 'FL',
    venue: 'Convention hotel (name shared after paid reservation)',
    page: 'https://splashtakeovers.com/events/81447',
    tickets: 'https://splashtakeovers.com/events/81447/orders/new',
    poster: '/images/events/couplesxcape-2026.jpg',
    locationSummary: 'Ft. Lauderdale / South Florida · Sep 10–13, 2026',
    short:
      'Couples-only hotel-takeover convention in Ft. Lauderdale / South Florida, September 10–13, 2026 (Thursday 1:30pm–Sunday 2am). Hotel name is withheld until a paid reservation. Tickets on splashtakeovers.com.',
    long: 'CouplesXcape 2026 is a Splash Takeovers couples-only lifestyle hotel takeover. Official times are Thursday, September 10, 2026 at 1:30pm through Sunday, September 13 at 2am. The published venue line is “Convention Hotel” in Florida; Splash says the hotel name and address are given after a reservation is paid in full. Official copy places the weekend in Ft. Lauderdale / South Florida. Contact info@splashtakeovers.com. Buy tickets on the official event page. This is a multi-day convention, not a local club night.',
  },
  {
    slug: 'xcapades-2027',
    title: 'Xcapades 2027',
    start: '2027-06-03',
    end: '2027-06-06',
    display: 'Jun 3–6, 2027',
    startsAt: '2027-06-03T13:30:00-05:00',
    endsAt: '2027-06-06T02:00:00-05:00',
    city: 'Houston',
    state: 'TX',
    venue: 'Convention hotel (name shared after paid reservation)',
    page: 'https://splashtakeovers.com/events/87999',
    tickets: 'https://splashtakeovers.com/events/87999/orders/new',
    poster: '/images/events/xcapades-2027.jpg',
    locationSummary: 'Houston, Texas · Jun 3–6, 2027',
    short:
      'Couples-only hotel-takeover convention in Houston, June 3–6, 2027 (Thursday 1:30pm–Sunday 2am). Official page places it near the Galleria. Hotel name is withheld until paid reservation.',
    long: 'Xcapades 2027 is a Splash Takeovers couples-only lifestyle hotel takeover. Official times are Thursday, June 3, 2027 at 1:30pm through Sunday, June 6 at 2am. The published venue line is “Convention Hotel” in Texas. Official copy places the event in Houston near the Galleria district; the hotel name is not published until a reservation is paid. Contact info@splashtakeovers.com. Tickets are on the official event page. Multi-day convention — not a local night.',
  },
  {
    slug: 'eroticon-2027',
    title: 'EROTICON 2027',
    start: '2027-08-05',
    end: '2027-08-08',
    display: 'Aug 5–8, 2027',
    startsAt: '2027-08-05T13:30:00-04:00',
    endsAt: '2027-08-08T03:00:00-04:00',
    city: 'Atlanta',
    state: 'GA',
    venue: '4-star convention hotel (name shared after paid reservation)',
    page: 'https://splashtakeovers.com/events/93743',
    tickets: 'https://splashtakeovers.com/events/93743/orders/new',
    poster: '/images/events/eroticon-2027.jpg',
    locationSummary: 'Atlanta, Georgia · Aug 5–8, 2027',
    short:
      'Couples-only hotel-takeover convention in Atlanta, August 5–8, 2027 (Thursday 1:30pm–Sunday 3am). Official venue line is a 4-star convention hotel; the name is withheld until paid reservation.',
    long: 'EROTICON 2027 is a Splash Takeovers couples-only lifestyle hotel takeover. Official times are Thursday, August 5, 2027 at 1:30pm through Sunday, August 8 at 3am. The published venue line is “4-Star Convention Hotel” in Atlanta. The hotel name is not published until a reservation is paid. Contact info@splashtakeovers.com. Tickets are on the official event page. Multi-day convention — not a local night.',
  },
]

const results = {}
for (const event of conventions) {
  const eventId = await upsertEvent(event.slug, {
    title: event.title,
    short_title: event.title,
    start_date: event.start,
    end_date: event.end,
    display_date: event.display,
    city: event.city,
    state: event.state,
    venue: event.venue,
    show_address_publicly: false,
    short_description: event.short,
    long_description: `<p>${event.long.replace(/&/g, '&amp;')}</p>`,
    category: 'Convention',
    event_type: 'convention',
    tags: ['splash-takeovers', 'convention', 'lifestyle'],
    logo: event.poster,
    images: [event.poster, LOGO],
    website: event.page,
    ticket_url: event.tickets,
    registration_required: true,
    organizer: ORG_NAME,
    organizer_name: ORG_NAME,
    organizer_website: WEBSITE,
    email: EMAIL,
    hotel_information: 'Hotel name is shared after a paid reservation. Splash does not publish the hotel name on the public event page.',
    status: 'published',
    published_at: now,
    seo_title: `${event.title} — ${event.city}, ${event.state}`.slice(0, 60),
    seo_description: event.short.slice(0, 160),
    seo_keywords: [event.title, ORG_NAME, event.city, event.state],
    source_attribution: 'Official site',
    last_synced_at: now,
  })

  const conventionId = await upsertListing('convention_listings', event.slug, {
    slug: event.slug,
    name: event.title,
    description: event.long,
    public_location_summary: event.locationSummary,
    logo_url: event.poster,
    cta_url: event.tickets,
    kink_social_canonical_url: null,
    org_slug: ORG_SLUG,
    org_display_name: ORG_NAME,
    starts_at: event.startsAt,
    ends_at: event.endsAt,
    status: 'published',
    source_system: 'ecke',
    c2k_source_type: 'convention',
    c2k_source_id: randomUUID(),
    source_attribution: 'Official site',
    last_synced_at: now,
    updated_at: now,
  })

  results[event.slug] = {
    eventId,
    conventionId,
    eventPath: `/events/${event.slug}`,
    conventionPath: `/conventions/${event.slug}`,
  }
}

console.log(
  JSON.stringify(
    {
      organization: { id: orgId, path: `/organizations/${ORG_SLUG}`, logo: LOGO },
      conventions: results,
    },
    null,
    2,
  ),
)
