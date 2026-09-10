import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing Supabase admin env')
  process.exit(1)
}

const VENUE_ID = '54c4bb53-3058-4a01-b909-e73fcb4eba79'
const events = JSON.parse(readFileSync(new URL('../tmp-korral-events.json', import.meta.url), 'utf8'))
const admin = createClient(url, key, { auth: { persistSession: false } })

function htmlBody(event) {
  const parts = []
  for (const para of String(event.longDescription || '').split(/\n{2,}/)) {
    const text = para.trim()
    if (text) parts.push(`<p>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`)
  }
  if (event.prices) {
    parts.push('<p><strong>Admission</strong></p>')
    parts.push(`<p>${String(event.prices).replace(/\n{2,}/g, '<br/>').replace(/\n/g, '<br/>')}</p>`)
  }
  if (event.officeNote && event.startTime >= '17:00') {
    parts.push(`<p>${String(event.officeNote).replace(/&/g, '&amp;')}</p>`)
  }
  return parts.join('')
}

const venueUpdate = {
  short_description:
    'The Korral is a private members-only, sex-positive club in Spring Grove, PA. Membership $50/year. Fri/Sat 7pm–2am. Monthly Kink Nights, heated pool, 18 themed rooms, BDSM hallway.',
  description:
    "The Korral is a private members-only, sex-positive club for open-minded adults in Spring Grove, PA. 5932 Colonial Valley Rd (same property as Kim's Krypt Haunted Mill—pull around to the back for parking).\n\nFriday and Saturday parties run 7pm–2am. Membership $50/year. Membership required for all attendees. Single males must be sponsored by a couple or single female.\n\nAmenities include a dance floor with stage and pole, full-service bar, two hot tubs, 18 themed rooms, pool tables, BDSM hallway, heated saltwater pool, store, selfie room, locker rooms, Private Stay rooms, and After Party rooms.\n\nKink Night is held once a month on a Friday and is education-focused rather than a traditional party night.\n\nContact: Info@TheKorral.com, 717-225-5082. Official events: https://www.thekorral.com/events.php",
  contact_email: 'Info@TheKorral.com',
  contact_phone: '717-225-5082',
  street_address: '5932 Colonial Valley Rd, Spring Grove, PA 17362',
  hours: 'Fr 19:00-02:00, Sa 19:00-02:00',
  category: 'Private Members Club',
  kind: 'club',
  logo_url: '/images/korral.png',
  cover_url: 'https://thekorral.com/events/ANNIVERSARY%20Oct%202.jpg',
  gallery_urls: [
    'https://thekorral.com/events/Friday%20Pool%20Party.jpg',
    'https://thekorral.com/events/Fresh%20Meat%20Friday.jpg',
    'https://thekorral.com/events/WEEKEND%20POOL%20PARTIES.jpg',
    'https://thekorral.com/events/ANNIVERSARY%20Oct%202.jpg',
    'https://thekorral.com/events/Halloween%20Bash%20Idea%202.jpg',
  ],
  membership_info:
    'Membership $50/year for couples, single males, and single females. Membership required. Single males must be sponsored by a couple or single female.',
  first_timer_info:
    'Fresh Meat Friday is the newcomer night. Weekday pool parties are members only — no first-time visits.',
  house_rules: 'Consent is mandatory. Confirm full house rules on thekorral.com before you visit.',
  alcohol_policy: 'BYOB with mixers on some pool days; full-service bar on party nights. Confirm with the venue.',
  photography_policy: 'No phones at the pool. Confirm photography rules with the venue.',
  parking:
    "On-site parking at 5932 Colonial Valley Rd — pull around to the back (same property as Kim's Krypt Haunted Mill).",
  age_restriction: 'Adults only. Membership and venue rules apply.',
  website_url: 'https://thekorral.com/',
  private_address: false,
  status: 'published',
  meta_title: 'The Korral - Spring Grove PA Private Members Club',
  meta_description:
    'The Korral is a private members-only club in Spring Grove, PA. Fri/Sat 7pm–2am. Membership $50/year. Monthly Kink Nights, pool, 18 themed rooms.',
}

const { error: venueError } = await admin.from('dungeon_venues').update(venueUpdate).eq('id', VENUE_ID)
if (venueError) {
  console.error('venue update failed', venueError.message)
  process.exit(1)
}

await admin.from('events').delete().eq('dungeon_slug', 'the-korral').like('slug', 'korral-%')

const rows = events.map((event) => ({
  title: event.title,
  slug: event.slug,
  start_date: event.startDate,
  end_date: event.startDate,
  display_date: `${event.dateLabel} · ${event.timeDisplay}`,
  start_time: event.startTime,
  end_time: event.endTime,
  city: 'Spring Grove',
  state: 'PA',
  venue: 'The Korral',
  address: '5932 Colonial Valley Rd, Spring Grove, PA 17362',
  show_address_publicly: true,
  short_description: event.shortDescription,
  long_description: htmlBody(event),
  category: event.category,
  event_type: event.event_type,
  tags: ['the-korral', 'pennsylvania', 'lifestyle'],
  logo: event.banner,
  images: [event.banner],
  website: event.url,
  ticket_url: event.ticketUrl,
  registration_required: true,
  ticket_price: event.prices.split('\n').filter(Boolean)[0] || null,
  organizer: 'The Korral',
  organizer_name: 'The Korral',
  email: 'Info@TheKorral.com',
  phone: '717-225-5082',
  dungeon_slug: 'the-korral',
  dungeon_venue_id: VENUE_ID,
  status: 'published',
  published_at: new Date().toISOString(),
  seo_title: `The Korral — ${event.title} — Spring Grove, PA`.slice(0, 60),
  seo_description: event.shortDescription.slice(0, 160),
  seo_keywords: ['The Korral', event.title, 'Spring Grove', 'PA'],
  source_attribution: 'The Korral',
  age_restriction: 'Membership required. Confirm age and house rules with the venue.',
  photography_policy: event.longDescription.includes('NO PHONES')
    ? 'No phones at the pool. Confirm photography rules with the venue.'
    : null,
  parking: 'On-site parking at 5932 Colonial Valley Rd — pull around to the back.',
  food_drink: 'BYOB / bar service varies by night. Confirm with The Korral.',
}))

const { error: insertError, data } = await admin.from('events').insert(rows).select('slug')
if (insertError) {
  console.error('event insert failed', insertError.message)
  process.exit(1)
}
console.log(`updated venue and inserted ${data?.length || 0} Korral events`)
