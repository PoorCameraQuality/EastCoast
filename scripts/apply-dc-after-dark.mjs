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

const groupId = await upsertListing('group_listings', 'dc-after-dark', {
  slug: 'dc-after-dark',
  name: 'DC After Dark',
  description:
    'DC After Dark (DCAD) is a Washington, D.C. kink community group. Official materials say leadership is 100% queer and primarily Black, women, and gender-nonconforming.\n\nThe published weekly gathering is Thursday happy hour, 6:30–10pm, at Midlands Beer Garden, 3333 Georgia Ave. NW, Washington, DC. Contact DcAfterDarkHH@gmail.com. Mailing list: http://bit.ly/subscribeDCAD. Code of conduct: http://www.tinyurl.com/DCADCodeOfConduct. Gender 101: https://bit.ly/DCADGender101.\n\nThe official site also mentions monthly online education, a monthly daytime gathering, twice-monthly / first-Monday cyber socials on Zoom, an annual hotel weekend, a one-day dungeon event, and summer camp. Those are not listed here until DCAD publishes 2026 dates. Confirm current plans on dcadhh.wordpress.com.',
  public_location_summary: 'Washington, D.C.',
  tags: ['bdsm', 'education', 'social', 'dc'],
  logo_url: null,
  cta_url: 'https://dcadhh.wordpress.com/',
  kink_social_canonical_url: null,
  org_slug: null,
  org_display_name: 'DC After Dark',
  status: 'published',
  source_system: 'ecke',
  c2k_source_type: 'group',
  c2k_source_id: randomUUID(),
  source_attribution: 'Official site',
  last_synced_at: now,
  updated_at: now,
})

const happyHours = [
  { slug: 'dc-after-dark-happy-hour-2026-09-17', date: '2026-09-17', display: 'Sep 17, 2026 · 6:30–10:00 PM' },
  { slug: 'dc-after-dark-happy-hour-2026-09-24', date: '2026-09-24', display: 'Sep 24, 2026 · 6:30–10:00 PM' },
  { slug: 'dc-after-dark-happy-hour-2026-10-01', date: '2026-10-01', display: 'Oct 1, 2026 · 6:30–10:00 PM' },
]

const eventIds = {}
for (const night of happyHours) {
  eventIds[night.slug] = await upsertEvent(night.slug, {
    title: 'DC After Dark Happy Hour',
    start_date: night.date,
    end_date: night.date,
    display_date: night.display,
    start_time: '18:30',
    end_time: '22:00',
    city: 'Washington',
    state: 'DC',
    venue: 'Midlands Beer Garden',
    address: '3333 Georgia Ave. NW, Washington, DC',
    show_address_publicly: true,
    short_description:
      'DC After Dark Thursday happy hour, 6:30–10pm at Midlands Beer Garden, 3333 Georgia Ave. NW, Washington, DC. Confirm the week on the official happy-hour page.',
    long_description:
      '<p>DC After Dark (DCAD) hosts a Thursday happy hour from 6:30pm to 10pm at Midlands Beer Garden, 3333 Georgia Ave. NW, Washington, DC. This dated night comes from the official events widget. It is a local social, not a convention.</p><p>Contact DcAfterDarkHH@gmail.com. Join the mailing list at http://bit.ly/subscribeDCAD. Code of conduct and Gender 101 links are on dcadhh.wordpress.com.</p>',
    category: 'Social',
    event_type: 'social',
    tags: ['dc-after-dark', 'dc', 'social'],
    logo: null,
    images: [],
    website: 'https://dcadhh.wordpress.com/events/happy-hour/',
    ticket_url: 'https://dcadhh.wordpress.com/events/happy-hour/',
    registration_required: false,
    organizer: 'DC After Dark',
    organizer_name: 'DC After Dark',
    organizer_website: 'https://dcadhh.wordpress.com/',
    email: 'DcAfterDarkHH@gmail.com',
    status: 'published',
    published_at: now,
    seo_title: `DC After Dark Happy Hour — ${night.display.split(' · ')[0]}`,
    seo_description:
      'DC After Dark Thursday happy hour, 6:30–10pm at Midlands Beer Garden in Washington, DC. Official details on dcadhh.wordpress.com.',
    source_attribution: 'Official site',
    last_synced_at: now,
  })
}

console.log(
  JSON.stringify(
    {
      group: { id: groupId, path: '/groups/dc-after-dark' },
      events: Object.fromEntries(
        happyHours.map((night) => [night.slug, { id: eventIds[night.slug], path: `/events/${night.slug}` }]),
      ),
      skipped:
        'No official 2026 dates were published for monthly education, daytime gatherings, Zoom cyber socials, hotel weekend, dungeon day, or summer camp. Ticketleap redirected to marketing home. WordPress blocked unattended logo downloads (403 / JS challenge), so logo_url is null — no empty image tag.',
    },
    null,
    2,
  ),
)
