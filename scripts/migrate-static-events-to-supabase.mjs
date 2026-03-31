/**
 * One-time: upsert all events from src/data/events.js into Supabase public.events,
 * set tags[] from inference, and link public.event_tags (for tag-filter pages later).
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (service role — never commit; bypasses RLS)
 *
 * Usage:
 *   node scripts/migrate-static-events-to-supabase.mjs           # run
 *   node scripts/migrate-static-events-to-supabase.mjs --dry   # count only
 *
 * After a successful migration, set UNIFIED_EVENTS_PREFER_DB=true in .env.local
 * if you want Supabase rows to override static for the same slug (optional).
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
dotenv.config({ path: join(root, '.env.local') })
dotenv.config({ path: join(root, '.env') })

const KNOWN = new Set([
  'beginner-friendly', 'vetted-event', 'vetted-events', 'lgbtq-friendly', 'rope', 'impact',
  'public', 'private', 'munch', 'play-party', 'play_party', 'classes', 'class', 'femdom',
  'bdsm-workshops', 'private-events', 'public-events', 'fetish-parties', 'dungeon-events',
  'bdsm-social', 'newcomer-events', 'advanced-play', 'impact-play', 'rope-jams',
  'latex-fetish', 'costume-events', 'night-events', 'weekend-events', 'bdsm-meetups',
  'kink-parties', 'community-events', 'convention', 'social',
])

function inferTagSlugs(event) {
  const text = `${event.name} ${event.excerpt} ${event.category} ${event.longDescription || ''}`.toLowerCase()
  const tags = new Set()
  const add = (s) => {
    if (KNOWN.has(s)) tags.add(s)
  }
  if (/munch/i.test(event.category) || /\bmunch\b/i.test(text)) add('munch')
  if (/play\s*party|play party/i.test(event.category) || /\bplay party\b/i.test(text)) add('play-party')
  if (/class|workshop|education/i.test(event.category) || /\bworkshop|class\b/i.test(text)) add('classes')
  if (/convention|conference|weekend event/i.test(event.category)) add('convention')
  if (/rope|shibari|kinbaku/i.test(text)) add('rope')
  if (/impact|flogger|spanking/i.test(text)) add('impact')
  if (/lgbtq|lgbt|queer|trans/i.test(text)) add('lgbtq-friendly')
  if (/beginner|newcomer|101|first timer/i.test(text)) add('beginner-friendly')
  if (/outdoor|public park/i.test(event.category) || /\boutdoor\b/i.test(text)) add('public')
  if (/private|members only|invite/i.test(text)) add('private')
  if (/femdom|dominatrix|mistress/i.test(text)) add('femdom')
  if (/latex|rubber|fetish fashion/i.test(text)) add('latex-fetish')
  if (/dungeon/i.test(text)) add('dungeon-events')
  if (/social|meetup|mixer/i.test(event.category)) add('bdsm-social')
  return Array.from(tags)
}

function mapEventToRow(e) {
  const tagSlugs = inferTagSlugs(e)
  const seo = e.seo || {}
  const kw = typeof seo.keywords === 'string'
    ? seo.keywords.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const features = Array.isArray(e.features) ? e.features.join('\n') : (e.features || '')

  return {
    title: e.name,
    short_title: null,
    slug: e.slug,
    start_date: e.date.start,
    end_date: e.date.end,
    display_date: e.date.display || e.date.start,
    city: e.location?.city || '',
    state: (e.location?.state || '').slice(0, 2),
    venue: e.venue || '',
    short_description: e.excerpt || '',
    long_description: e.longDescription || e.excerpt || '',
    seo_description: seo.description || '',
    category: e.category || 'Event',
    tags: tagSlugs,
    logo: e.logo || '',
    images: [],
    website: e.website || '',
    organizer: e.organizer || 'East Coast Kink Events',
    email: 'listings@eastcoastkinkevents.com',
    phone: '',
    organizer_website: '',
    early_bird_price: '',
    regular_price: '',
    at_door_price: '',
    includes: '',
    features,
    seo_title: seo.title || '',
    seo_keywords: kw,
    status: 'published',
    created_at: new Date().toISOString(),
    created_by: 'migration-static-events',
    meta_title: seo.title || null,
    meta_description: seo.description || null,
    organizer_name: e.organizer || null,
  }
}

async function main() {
  const dry = process.argv.includes('--dry')
  const eventsPath = join(root, 'src/data/events.js')
  const { getAllEvents } = await import(pathToFileURL(eventsPath).href)
  const list = getAllEvents()

  console.log(`Found ${list.length} events in events.js`)
  if (dry) {
    console.log('Dry run — no writes. Add SUPABASE_SERVICE_ROLE_KEY to .env.local for a real run.')
    process.exit(0)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey)

  const { data: tagRows, error: tagErr } = await supabase.from('tags').select('id, slug')
  if (tagErr) {
    console.error('Failed to load tags:', tagErr.message)
    process.exit(1)
  }
  const tagIdBySlug = new Map((tagRows || []).map((r) => [r.slug, r.id]))

  const chunkSize = 20
  let linked = 0
  let upserted = 0

  for (let i = 0; i < list.length; i += chunkSize) {
    const chunk = list.slice(i, i + chunkSize)
    const rows = chunk.map(mapEventToRow)
    const { data, error } = await supabase.from('events').upsert(rows, { onConflict: 'slug' }).select('id, slug')

    if (error) {
      console.error('Upsert error:', error.message)
      process.exit(1)
    }
    upserted += data?.length || 0

    for (const row of data || []) {
      const ev = chunk.find((x) => x.slug === row.slug)
      if (!ev) continue
      const slugs = inferTagSlugs(ev)

      await supabase.from('event_tags').delete().eq('event_id', row.id)

      const pairs = []
      for (const slug of slugs) {
        const tid = tagIdBySlug.get(slug)
        if (tid) pairs.push({ event_id: row.id, tag_id: tid })
      }
      if (pairs.length) {
        const { error: etErr } = await supabase.from('event_tags').insert(pairs)
        if (etErr) {
          console.error('event_tags insert:', etErr.message, row.slug)
        } else {
          linked += pairs.length
        }
      }
    }
    process.stdout.write(`\rUpserted ${Math.min(i + chunkSize, list.length)} / ${list.length}`)
  }
  console.log(`\nDone. Upserted ${upserted} events, ${linked} event_tag links (rows).`)
  console.log('Optional: set UNIFIED_EVENTS_PREFER_DB=true in .env.local so DB overrides static for same slug.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
