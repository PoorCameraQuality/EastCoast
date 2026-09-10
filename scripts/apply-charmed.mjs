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

const EVENT_SLUG = 'charmed'
const CONVENTION_SLUG = 'charmed'
const WEBSITE = 'https://charmedhypno.org/'
const LOGO = '/images/charmed.png'
const TICKET_URL = 'https://br.app.neoncrm.com/event.jsp?event=162'
const EMAIL = 'charmedreg@br.org'

const SHORT_DESCRIPTION =
  'Charmed! 2027 is January 14–17, 2027 (MLK weekend). Mid-Atlantic erotic, recreational, and educational hypnosis — hybrid in-person and online. Hotel name is shared at registration.'

const LONG_DESCRIPTION = `Charmed! 2027 runs January 14–17, 2027 (MLK weekend) in Maryland. Join the Mid-Atlantic erotic, recreational, and educational hypnosis event.

Charmed! has been setting the standard for in-person erotic and recreational hypnosis conventions since 2016. Attendees visit from around the world for a schedule that includes basic education, recreational demonstrations, and erotic experiences in a welcoming environment.

**Hybrid convention.** Since 2023, Charmed! broadcasts classes from the physical convention space to the online platform so remote attendees can hear the class, interact with presenters, and follow questions from the room. A class streaming catalog is part of recent years’ programming.

**Location.** Charmed! 2027 is held in Maryland. The hotel name is shared when you register. If you have been to Charmed in the last five years, it is the same hotel. Offsite parking at the hotel is free.

**Registration.** Registration is through Black Rose. Registration opens July 5, 2026 and ends December 31, 2026 for both hybrid and online-only tickets. If the Black Rose page is not accessible, email charmedreg@br.org.

**In-person health rule (from the official site).** The vaccination deadline to attend Charmed! 2027 in person is December 31, 2026.

**Get involved.** Volunteer applications and presenter class proposals open July 5, 2026. Regular class proposals close October 31, 2026. See the official site for volunteer details, Discord, Substack, and event rules.`

const FEATURES = JSON.stringify([
  'Charmed! 2027 · Jan 14–17, 2027 (MLK weekend)',
  'Mid-Atlantic erotic, recreational, and educational hypnosis',
  'Hybrid in-person + online',
  'Maryland hotel (name shared at registration)',
  'Registration via Black Rose',
  'Registration July 5–Dec 31, 2026',
  'In-person vaccination deadline Dec 31, 2026',
  'Classes, recreational demonstrations, and erotic experiences',
  'Class streaming catalog',
  'Volunteer and presenter calls',
])

const INCLUDES = JSON.stringify([
  'Hybrid in-person and online attendance',
  'Education, recreational demos, and erotic hypnosis programming',
  'Official Discord and monthly Substack',
  'Volunteer and presenter calls',
])

const admin = createClient(url, key, { auth: { persistSession: false } })
const now = new Date().toISOString()

const { data: existingEvent, error: lookupError } = await admin
  .from('events')
  .select('id, slug')
  .eq('slug', EVENT_SLUG)
  .maybeSingle()

if (lookupError) throw new Error(`Event lookup failed: ${lookupError.message}`)
if (!existingEvent?.id) throw new Error(`No published events row for slug ${EVENT_SLUG}`)

const { error: eventError } = await admin
  .from('events')
  .update({
    title: 'Charmed!',
    short_title: 'Charmed! 2027',
    start_date: '2027-01-14',
    end_date: '2027-01-17',
    display_date: 'Jan 14-17, 2027',
    city: 'Maryland',
    state: 'MD',
    venue: 'Hotel announced at registration',
    short_description: SHORT_DESCRIPTION,
    long_description: LONG_DESCRIPTION,
    seo_description:
      'Charmed! 2027 runs Jan 14–17, 2027 in Maryland (MLK weekend). Hybrid erotic, recreational, and educational hypnosis. Register via Black Rose.',
    seo_title: 'Charmed! 2027: Mid-Atlantic Hypnosis Convention',
    seo_keywords: [
      'Charmed 2027',
      'Charmed hypnosis',
      'Maryland hypnosis convention',
      'erotic hypnosis',
      'recreational hypnosis',
      'hybrid convention',
      'MLK weekend',
      'Black Rose',
    ],
    category: 'Convention',
    event_type: 'convention',
    features: FEATURES,
    includes: INCLUDES,
    logo: LOGO,
    website: WEBSITE,
    email: EMAIL,
    organizer: 'Charmed',
    organizer_name: 'Charmed',
    organizer_website: WEBSITE,
    status: 'published',
    hotel_information:
      'Hotel name is shared when you register. If you have been to Charmed in the last five years, it is the same hotel.',
    parking: 'Free parking at the hotel for attendees not staying onsite.',
    show_address_publicly: false,
    ticket_url: TICKET_URL,
    registration_required: true,
    registration_deadline: '2026-12-31',
    staff_application_url: 'https://charmedhypno.org/volunteer/',
    presenter_application_url: WEBSITE,
    staff_applications_open: true,
    presenter_applications_open: true,
    is_online: false,
  })
  .eq('id', existingEvent.id)

if (eventError) throw new Error(`Event update failed: ${eventError.message}`)

const { data: existingConvention } = await admin
  .from('convention_listings')
  .select('id, c2k_source_id')
  .eq('slug', CONVENTION_SLUG)
  .maybeSingle()

const conventionRow = {
  slug: CONVENTION_SLUG,
  name: 'Charmed! 2027',
  description: LONG_DESCRIPTION,
  public_location_summary: 'Maryland · Jan 14–17, 2027 (MLK weekend)',
  logo_url: LOGO,
  cta_url: TICKET_URL,
  kink_social_canonical_url: null,
  org_slug: null,
  org_display_name: 'Charmed',
  starts_at: '2027-01-14T00:00:00-05:00',
  ends_at: '2027-01-17T23:59:59-05:00',
  status: 'published',
  source_system: 'ecke',
  c2k_source_type: 'convention',
  source_attribution: 'Official site',
  last_synced_at: now,
  updated_at: now,
}

let conventionListingId = existingConvention?.id ?? null
if (existingConvention?.id) {
  const { error } = await admin.from('convention_listings').update(conventionRow).eq('id', existingConvention.id)
  if (error) throw new Error(`Convention listing update failed: ${error.message}`)
} else {
  const { data, error } = await admin
    .from('convention_listings')
    .insert({ ...conventionRow, c2k_source_id: randomUUID() })
    .select('id')
    .single()
  if (error || !data) throw new Error(`Convention listing insert failed: ${error?.message || 'unknown'}`)
  conventionListingId = data.id
}

console.log(
  JSON.stringify(
    {
      eventId: existingEvent.id,
      conventionListingId,
      pages: {
        event: `/events/${EVENT_SLUG}`,
        convention: `/conventions/${CONVENTION_SLUG}`,
      },
    },
    null,
    2,
  ),
)
