import { readFileSync, writeFileSync } from 'node:fs'

const VENUE_ID = '54c4bb53-3058-4a01-b909-e73fcb4eba79'
const events = JSON.parse(readFileSync(new URL('../tmp-korral-events.json', import.meta.url), 'utf8'))

function lit(value) {
  if (value == null || value === '') return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

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

const rows = events.map((event) => {
  const display = `${event.dateLabel} · ${event.timeDisplay}`
  return `(
    ${lit(event.title)},
    ${lit(event.slug)},
    ${lit(event.startDate)}::date,
    ${lit(event.startDate)}::date,
    ${lit(display)},
    ${lit(event.startTime)},
    ${lit(event.endTime)},
    'Spring Grove',
    'PA',
    'The Korral',
    ${lit('5932 Colonial Valley Rd, Spring Grove, PA 17362')},
    true,
    ${lit(event.shortDescription)},
    ${lit(htmlBody(event))},
    ${lit(event.category)},
    ${lit(event.event_type)},
    ARRAY['the-korral','pennsylvania','lifestyle']::text[],
    ${lit(event.banner)},
    ARRAY[${lit(event.banner)}]::text[],
    ${lit(event.url)},
    ${lit(event.ticketUrl)},
    true,
    ${lit(event.prices.split('\n').filter(Boolean)[0] || null)},
    'The Korral',
    'The Korral',
    'Info@TheKorral.com',
    '717-225-5082',
    'the-korral',
    '${VENUE_ID}'::uuid,
    'published',
    now(),
    ${lit(`The Korral — ${event.title} — Spring Grove, PA`)},
    ${lit(event.shortDescription.slice(0, 160))},
    ARRAY['The Korral', ${lit(event.title)}, 'Spring Grove', 'PA']::text[],
    'The Korral',
    'Membership required. Confirm age and house rules with the venue.',
    ${lit(event.longDescription.includes('NO PHONES') ? 'No phones at the pool. Confirm photography rules with the venue.' : null)},
    'On-site parking at 5932 Colonial Valley Rd — pull around to the back.',
    'BYOB / bar service varies by night. Confirm with The Korral.'
  )`
})

const sql = `
UPDATE public.dungeon_venues
SET
  short_description = 'The Korral is a private members-only, sex-positive club in Spring Grove, PA. Membership $50/year. Fri/Sat 7pm–2am. Monthly Kink Nights, heated pool, 18 themed rooms, BDSM hallway.',
  description = ${lit(`The Korral is a private members-only, sex-positive club for open-minded adults in Spring Grove, PA. 5932 Colonial Valley Rd (same property as Kim's Krypt Haunted Mill—pull around to the back for parking).

Friday and Saturday parties run 7pm–2am. Membership $50/year. Membership required for all attendees. Single males must be sponsored by a couple or single female.

Amenities include a dance floor with stage and pole, full-service bar, two hot tubs, 18 themed rooms, pool tables, BDSM hallway, heated saltwater pool, store, selfie room, locker rooms, Private Stay rooms, and After Party rooms.

Kink Night is held once a month on a Friday and is education-focused rather than a traditional party night.

Contact: Info@TheKorral.com, 717-225-5082. Official events: https://www.thekorral.com/events.php`)},
  contact_email = 'Info@TheKorral.com',
  contact_phone = '717-225-5082',
  street_address = '5932 Colonial Valley Rd, Spring Grove, PA 17362',
  hours = 'Fr 19:00-02:00, Sa 19:00-02:00',
  category = 'Private Members Club',
  kind = 'club',
  logo_url = '/images/korral.png',
  cover_url = 'https://thekorral.com/events/ANNIVERSARY%20Oct%202.jpg',
  gallery_urls = ARRAY[
    'https://thekorral.com/events/Friday%20Pool%20Party.jpg',
    'https://thekorral.com/events/Fresh%20Meat%20Friday.jpg',
    'https://thekorral.com/events/WEEKEND%20POOL%20PARTIES.jpg',
    'https://thekorral.com/events/ANNIVERSARY%20Oct%202.jpg',
    'https://thekorral.com/events/Halloween%20Bash%20Idea%202.jpg'
  ]::text[],
  membership_info = 'Membership $50/year for couples, single males, and single females. Membership required. Single males must be sponsored by a couple or single female.',
  first_timer_info = 'Fresh Meat Friday is the newcomer night. Weekday pool parties are members only — no first-time visits.',
  house_rules = 'Consent is mandatory. Confirm full house rules on thekorral.com before you visit.',
  alcohol_policy = 'BYOB with mixers on some pool days; full-service bar on party nights. Confirm with the venue.',
  photography_policy = 'No phones at the pool. Confirm photography rules with the venue.',
  parking = 'On-site parking at 5932 Colonial Valley Rd — pull around to the back (same property as Kim''s Krypt Haunted Mill).',
  age_restriction = 'Adults only. Membership and venue rules apply.',
  website_url = 'https://thekorral.com/',
  private_address = false,
  status = 'published',
  published_at = COALESCE(published_at, now()),
  updated_at = now(),
  meta_title = 'The Korral - Spring Grove PA Private Members Club',
  meta_description = 'The Korral is a private members-only club in Spring Grove, PA. Fri/Sat 7pm–2am. Membership $50/year. Monthly Kink Nights, pool, 18 themed rooms.'
WHERE id = '${VENUE_ID}';

DELETE FROM public.events WHERE dungeon_slug = 'the-korral' AND slug LIKE 'korral-%';

INSERT INTO public.events (
  title, slug, start_date, end_date, display_date, start_time, end_time,
  city, state, venue, address, show_address_publicly,
  short_description, long_description, category, event_type, tags,
  logo, images, website, ticket_url, registration_required, ticket_price,
  organizer, organizer_name, email, phone, dungeon_slug, dungeon_venue_id,
  status, published_at, seo_title, seo_description, seo_keywords,
  source_attribution, age_restriction, photography_policy, parking, food_drink
) VALUES
${rows.join(',\n')};
`

writeFileSync(new URL('../tmp-korral-insert.sql', import.meta.url), sql)
console.log(`wrote SQL for ${events.length} events`)
