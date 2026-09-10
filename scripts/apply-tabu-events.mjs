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
const PLACE_SLUG = 'tabu-social-club-catonsville-md'
const CLUB_LOGO = '/images/tabu-social-club.png'
const ADDRESS = '1115 N. Rolling Road, Catonsville, MD 21228'
const EMAIL = 'tabulife@tabulife.com'
const PHONE = '(410) 869-0001'
const WEBSITE = 'https://www.tabulife.com/'

const EVENTS = [
  {
    id: '1858',
    title: 'Blackout-Friday',
    startDate: '2026-09-11',
    startTime: '21:00',
    endTime: '02:00',
    display: 'Sep 11, 2026 · 9:00 PM – 2:00 AM',
    path: '/lifestyle-swingers-events/event/1858-blackout-friday.html',
    kind: 'play_party',
    short:
      'Friday blackout night at Tabu Social Club in Catonsville, MD. Official hours 9pm–2am. Membership and door fees apply — confirm on the official event page.',
    long: 'Tabu Social Club hosts Blackout-Friday on September 11, 2026 in Catonsville, Maryland. The official calendar lists 9pm–2am. This is a local club night, not a convention. Membership and visit fees are set by Tabu; confirm current rates and house rules on the official event page.',
  },
  {
    id: '1888',
    title: 'One Love with BlackRingSwing',
    startDate: '2026-09-12',
    startTime: '21:00',
    endTime: '03:00',
    display: 'Sep 12, 2026 · 9:00 PM – 3:00 AM',
    path: '/lifestyle-swingers-events/event/1888-one-love-with-blackringswing.html',
    kind: 'play_party',
    short:
      'Saturday One Love night at Tabu with BlackRingSwing. Official hours 9pm September 12 through 3am September 13. Confirm dress theme and fees on the official page.',
    long: 'One Love is a Saturday club night at Tabu Social Club on September 12, 2026, listed 9pm–3am (into September 13). Official materials name BlackRingSwing as co-host. Membership and door policies are on tabulife.com. This is a local on-premise night, not a hotel takeover.',
  },
  {
    id: '1877',
    title: 'Casual and Newbie Night Friday',
    startDate: '2026-09-18',
    startTime: '21:00',
    endTime: '02:00',
    display: 'Sep 18, 2026 · 9:00 PM – 2:00 AM',
    path: '/lifestyle-swingers-events/event/1877-casual-and-newbie-night-friday.html',
    kind: 'social',
    short:
      'Friday casual / newbie night at Tabu Social Club. Official hours 9pm–2am. Extra hosts for tours; confirm membership steps on the official page.',
    long: 'Tabu lists Casual and Newbie Night on Friday, September 18, 2026, 9pm–2am. Official copy describes a relaxed dress night aimed at new couples, with extra host couples for tours. Apply and confirm fees on the official event page before you go.',
  },
  {
    id: '1895',
    title: 'Sneaker Ball',
    startDate: '2026-09-19',
    startTime: '21:00',
    endTime: '03:00',
    display: 'Sep 19, 2026 · 9:00 PM – 3:00 AM',
    path: '/lifestyle-swingers-events/event/1895-sneaker-ball.html',
    kind: 'play_party',
    short:
      'Saturday Sneaker Ball at Tabu Social Club. Official detail page lists 9pm–3am (sidebar 9:00 am looks like a listing glitch). Confirm times on tabulife.com.',
    long: 'Sneaker Ball is listed for Saturday, September 19, 2026 at Tabu Social Club. The calendar sidebar showed 9:00 am, but the official detail page says the club is open 9pm–3am, which matches Saturday house hours. ECKE is using those house hours. Confirm times, dress, and fees on the official event page. No separate hotel-takeover details are published there.',
  },
  {
    id: '1871',
    title: 'Happy-Hour',
    startDate: '2026-09-25',
    startTime: '21:00',
    endTime: '02:00',
    display: 'Sep 25, 2026 · 9:00 PM – 2:00 AM',
    path: '/lifestyle-swingers-events/event/1871-happy-hour.html',
    kind: 'social',
    short:
      'Friday happy hour at Tabu, 9pm–2am. Official page lists reduced rates until 10:30pm and a Consent LLC BDSM demo and Q&A.',
    long: 'Tabu’s Friday Happy-Hour on September 25, 2026 runs 9pm–2am. Official materials list reduced visit fees until 10:30pm and a Consent LLC BDSM demonstration and Q&A. Membership is still required. Confirm current door fees on the official event page.',
  },
  {
    id: '1865',
    title: 'Blackout-Sat',
    startDate: '2026-09-26',
    startTime: '21:00',
    endTime: '03:00',
    display: 'Sep 26, 2026 · 9:00 PM – 3:00 AM',
    path: '/lifestyle-swingers-events/event/1865-blackout-sat.html',
    kind: 'play_party',
    short:
      'Saturday blackout night at Tabu Social Club. Official hours 9pm–3am. Confirm membership and door fees on the official page.',
    long: 'Blackout-Sat is a Saturday club night at Tabu Social Club on September 26, 2026, listed 9pm–3am. Local on-premise night only. Confirm current fees and house rules on tabulife.com before you visit.',
  },
  {
    id: '1902',
    title: 'Tabu’s 50 Shades of Play — Orange',
    startDate: '2026-10-02',
    startTime: '21:00',
    endTime: '02:00',
    display: 'Oct 2, 2026 · 9:00 PM – 2:00 AM',
    path: '/lifestyle-swingers-events/event/1902-tabus-50-shades-of-play-orange-event.html',
    kind: 'play_party',
    short:
      'Friday 50 Shades of Play (orange theme) at Tabu. Official hours 9pm–2am. Membership required; confirm theme and fees on the official page.',
    long: 'Tabu lists 50 Shades of Play — Orange on Friday, October 2, 2026, 9pm–2am. Official materials describe a color-themed club night. Confirm dress notes and fees on the official event page. Local night, not a convention.',
  },
  {
    id: '1884',
    title: 'Anything Anywhere Party',
    startDate: '2026-10-03',
    startTime: '21:00',
    endTime: '03:00',
    display: 'Oct 3, 2026 · 9:00 PM – 3:00 AM',
    path: '/lifestyle-swingers-events/event/1884-anything-anywhere-party.html',
    kind: 'play_party',
    short:
      'Saturday Anything Anywhere night at Tabu Social Club. Official hours 9pm–3am. Confirm membership and door fees on the official page.',
    long: 'Anything Anywhere is listed for Saturday, October 3, 2026 at Tabu Social Club, 9pm–3am. Official calendar treats it as a regular Saturday club night. Confirm fees and house rules on the official event page.',
  },
  {
    id: '1859',
    title: 'Blackout-Friday',
    startDate: '2026-10-09',
    startTime: '21:00',
    endTime: '02:00',
    display: 'Oct 9, 2026 · 9:00 PM – 2:00 AM',
    path: '/lifestyle-swingers-events/event/1859-blackout-friday.html',
    kind: 'play_party',
    short:
      'Friday blackout night at Tabu Social Club on October 9, 2026. Official hours 9pm–2am. Confirm fees on the official page.',
    long: 'Tabu lists another Blackout-Friday on October 9, 2026, 9pm–2am, at 1115 N. Rolling Road, Catonsville. Local club night. Confirm membership status and door fees on the official event page.',
  },
  {
    id: '1907',
    title: 'Hallow-Swing 2026',
    startDate: '2026-10-10',
    startTime: '21:00',
    endTime: '03:00',
    display: 'Oct 10, 2026 · 9:00 PM – 3:00 AM',
    path: '/lifestyle-swingers-events/event/1907-hallow-swing-2026.html',
    kind: 'play_party',
    short:
      'Saturday Hallow-Swing at Tabu, October 10 9pm through October 11 3am. Official Halloween costume night. Tickets on the official page.',
    long: 'Hallow-Swing 2026 is Tabu’s Saturday Halloween costume night, listed October 10, 2026 9pm through October 11 3am. It is one overnight club night, not a multi-day convention. Official materials mention prepaid tickets and a costume contest. Confirm ticket prices and membership rules on the official event page.',
  },
  {
    id: '1909',
    title: 'T-Shirt Night at TABU',
    startDate: '2026-10-16',
    startTime: '21:00',
    endTime: '02:00',
    display: 'Oct 16, 2026 · 9:00 PM – 2:00 AM',
    path: '/lifestyle-swingers-events/event/1909-t-shirt-night-at-tabu.html',
    kind: 'play_party',
    short:
      'Friday T-Shirt Night at Tabu Social Club. Official hours 9pm–2am on October 16. Confirm dress notes and fees on the official page.',
    long: 'T-Shirt Night is listed Friday, October 16, 2026, 9pm–2am at Tabu Social Club. Official hours match Friday house time. Confirm current fees and any theme notes on the official event page.',
  },
  {
    id: '1910',
    title: 'Tabu’s Day of the Dead Event',
    startDate: '2026-10-17',
    startTime: '21:00',
    endTime: '03:00',
    display: 'Oct 17, 2026 · 9:00 PM – 3:00 AM',
    path: '/lifestyle-swingers-events/event/1910-tabus-day-of-the-dead-event.html',
    kind: 'play_party',
    short:
      'Saturday Day of the Dead night at Tabu, October 17 9pm–3am. Confirm theme and fees on the official page.',
    long: 'Tabu lists a Day of the Dead club night on Saturday, October 17, 2026, 9pm–3am. Local Saturday hours. Confirm theme notes, membership, and door fees on the official event page.',
  },
  {
    id: '1878',
    title: 'Casual and Newbie Night Friday',
    startDate: '2026-10-23',
    startTime: '21:00',
    endTime: '02:00',
    display: 'Oct 23, 2026 · 9:00 PM – 2:00 AM',
    path: '/lifestyle-swingers-events/event/1878-casual-and-newbie-night-friday.html',
    kind: 'social',
    short:
      'Friday casual / newbie night at Tabu on October 23, 2026. Official hours 9pm–2am. Confirm membership steps on the official page.',
    long: 'Another Casual and Newbie Night is listed Friday, October 23, 2026, 9pm–2am at Tabu Social Club. Official materials describe extra hosts for new members. Confirm application steps and fees on the official event page.',
  },
  {
    id: '1908',
    title: 'Pink Save the Ta Tas Party',
    startDate: '2026-10-24',
    startTime: '21:00',
    endTime: '03:00',
    display: 'Oct 24, 2026 · 9:00 PM – 3:00 AM',
    path: '/lifestyle-swingers-events/event/1908-pink-save-the-ta-tas-party.html',
    kind: 'play_party',
    short:
      'Saturday pink-theme night at Tabu on October 24, 2026, 9pm–3am. Official page notes a portion of proceeds for Susan G. Komen. Confirm fees there.',
    long: 'Pink Save the Ta Tas is listed Saturday, October 24, 2026, 9pm–3am at Tabu Social Club. Official materials mention a pink dress theme and that a portion of proceeds benefits the Susan G. Komen Foundation. Confirm current fees on the official event page.',
  },
  {
    id: '1872',
    title: 'Happy-Hour',
    startDate: '2026-10-30',
    startTime: '21:00',
    endTime: '02:00',
    display: 'Oct 30, 2026 · 9:00 PM – 2:00 AM',
    path: '/lifestyle-swingers-events/event/1872-happy-hour.html',
    kind: 'social',
    short:
      'Friday happy hour at Tabu on October 30, 2026. Official hours 9pm–2am with listed early-evening discounts. Confirm fees on the official page.',
    long: 'Tabu lists Happy-Hour on Friday, October 30, 2026, 9pm–2am. Official copy mentions discounted visit fees and free entry for single females until 10:30pm, excluding membership. Confirm current rates on the official event page.',
  },
  {
    id: '1868',
    title: 'Halloween Blackout',
    startDate: '2026-10-31',
    startTime: '21:00',
    endTime: '03:00',
    display: 'Oct 31, 2026 · 9:00 PM – 3:00 AM',
    path: '/lifestyle-swingers-events/event/1868-halloween-blackout.html',
    kind: 'play_party',
    short:
      'Saturday Halloween Blackout at Tabu, October 31 9pm through November 1 3am. Confirm tickets and fees on the official page.',
    long: 'Halloween Blackout is listed October 31, 2026 9pm through November 1 3am at Tabu Social Club. One overnight Saturday night. Official materials mention tickets and a costume contest; confirm current box-office details on the official event page.',
  },
  {
    id: '1885',
    title: 'Anything Anywhere Party',
    startDate: '2026-11-07',
    startTime: '21:00',
    endTime: '03:00',
    display: 'Nov 7, 2026 · 9:00 PM – 3:00 AM',
    path: '/lifestyle-swingers-events/event/1885-anything-anywhere-party.html',
    kind: 'play_party',
    short:
      'Saturday Anything Anywhere night at Tabu on November 7, 2026. Official hours 9pm–3am. Confirm fees on the official page.',
    long: 'Tabu lists Anything Anywhere on Saturday, November 7, 2026, 9pm–3am. Local Saturday club night. Confirm membership and door fees on the official event page.',
  },
  {
    id: '1860',
    title: 'Blackout-Friday',
    startDate: '2026-11-13',
    startTime: '21:00',
    endTime: '02:00',
    display: 'Nov 13, 2026 · 9:00 PM – 2:00 AM',
    path: '/lifestyle-swingers-events/event/1860-blackout-friday.html',
    kind: 'play_party',
    short:
      'Friday blackout night at Tabu on November 13, 2026. Official hours 9pm–2am. Confirm fees on the official page.',
    long: 'Blackout-Friday on November 13, 2026 is listed 9pm–2am at Tabu Social Club. Local Friday night. Confirm current fees and house rules on the official event page.',
  },
  {
    id: '1889',
    title: 'Bling',
    startDate: '2026-11-14',
    startTime: '21:00',
    endTime: '03:00',
    display: 'Nov 14, 2026 · 9:00 PM – 3:00 AM',
    path: '/lifestyle-swingers-events/event/1889-bling.html',
    kind: 'play_party',
    short:
      'Saturday Bling night at Tabu with BlackRingSwing. Calendar showed midnight November 14; the detail page says 9pm–3am. Confirm times on the official site.',
    long: 'Bling is listed for November 14, 2026 at Tabu Social Club. The public list showed 12:00 am November 14 through 3:00 am November 15, which does not match Saturday house hours. The official detail page says open 9pm–3am. ECKE is using those Saturday house hours. Official materials name BlackRingSwing as co-host. Confirm times and fees on tabulife.com before you go.',
  },
  {
    id: '1879',
    title: 'Casual and Newbie Night Friday',
    startDate: '2026-11-20',
    startTime: '21:00',
    endTime: '02:00',
    display: 'Nov 20, 2026 · 9:00 PM – 2:00 AM',
    path: '/lifestyle-swingers-events/event/1879-casual-and-newbie-night-friday.html',
    kind: 'social',
    short:
      'Friday casual / newbie night at Tabu on November 20, 2026. Official hours 9pm–2am. Confirm membership steps on the official page.',
    long: 'Tabu lists Casual and Newbie Night on Friday, November 20, 2026, 9pm–2am. Local Friday social night for new and returning members. Confirm application steps and fees on the official event page.',
  },
]

function slugify(title, id) {
  const base = title
    .toLowerCase()
    .replace(/’/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return `tabu-${id}-${base || 'event'}`
}

function htmlBody(text) {
  return `<p>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`
}

const { error: deleteError } = await admin
  .from('events')
  .delete()
  .eq('dungeon_slug', PLACE_SLUG)
  .like('slug', 'tabu-%')
if (deleteError) {
  console.error('Tabu delete failed', deleteError.message)
  process.exit(1)
}

const rows = EVENTS.map((event) => {
  const eventUrl = `https://tabulife.com${event.path}`
  const flyer = `/images/events/tabu-${event.id}.png`
  return {
    title: event.title,
    slug: slugify(event.title, event.id),
    start_date: event.startDate,
    end_date: event.startDate,
    display_date: event.display,
    start_time: event.startTime,
    end_time: event.endTime,
    city: 'Catonsville',
    state: 'MD',
    venue: 'Tabu Social Club',
    address: ADDRESS,
    show_address_publicly: true,
    short_description: event.short,
    long_description: htmlBody(event.long),
    category: event.kind === 'social' ? 'Social' : 'Play party',
    event_type: event.kind,
    tags: ['tabu-social-club', 'maryland', 'lifestyle'],
    logo: flyer,
    images: [flyer, CLUB_LOGO],
    website: eventUrl,
    ticket_url: eventUrl,
    registration_required: true,
    organizer: 'Tabu Social Club',
    organizer_name: 'Tabu Social Club',
    organizer_website: WEBSITE,
    email: EMAIL,
    phone: PHONE,
    dungeon_slug: PLACE_SLUG,
    status: 'published',
    published_at: now,
    seo_title: `Tabu — ${event.title} — Catonsville, MD`.slice(0, 60),
    seo_description: event.short.slice(0, 160),
    seo_keywords: ['Tabu Social Club', event.title, 'Catonsville', 'MD'],
    source_attribution: 'Official site',
    last_synced_at: now,
    age_restriction: 'Adults only. Membership and venue rules apply — confirm with Tabu.',
  }
})

const { error: insertError, data } = await admin.from('events').insert(rows).select('slug, start_date')
if (insertError) {
  console.error('Tabu insert failed', insertError.message)
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      deletedAndInserted: data?.length || 0,
      slugs: (data || []).map((row) => ({ slug: row.slug, start: row.start_date })),
      skipped:
        '8 additional Tabu calendar rows sit behind RSEventsPro “Load more” (20 of 28). The official iCal feed only returned 10 events and did not include the rest. No unpublished dates were invented.',
    },
    null,
    2,
  ),
)
