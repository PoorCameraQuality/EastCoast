/**
 * One-time: upsert vendors from src/data/vendors.js into public.vendors,
 * link vendor_seo_tags via vendor_seo_tag_links (SEO hub slugs inferred from taxonomy).
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/migrate-static-vendors-to-supabase.mjs
 *   node scripts/migrate-static-vendors-to-supabase.mjs --dry
 *
 * After migration, optional: UNIFIED_VENDORS_PREFER_DB=true so DB overrides static for same slug.
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

/** Mirrors src/lib/vendorHubTagMap.ts VENDOR_HUB_TO_TAXONOMY */
const HUB_TO_TAXONOMY = {
  rope: ['rope-suspension', 'restraints-bondage-gear', 'rope-fabric'],
  latex: ['latex-rubber', 'clothing-fetish-wear', 'roleplay-costume'],
  leather: ['leather', 'handmade-leather', 'vegan-leather'],
  impact: ['impact-implements', 'impact-play'],
  restraints: ['restraints-bondage-gear', 'chastity-cages', 'dungeon-equipment-furniture'],
  clothing: ['clothing-fetish-wear', 'roleplay-costume', 'textile-clothing-maker', 'jewelry-collars'],
  toys: ['insertables-body-toys', 'sensation-play-tools', 'electro-play-gear'],
}

const SEO_HUBS = Object.keys(HUB_TO_TAXONOMY)

function seoHubTagsFromTaxonomySlugs(taxonomySlugs) {
  const tax = new Set(taxonomySlugs)
  const out = []
  for (const hub of SEO_HUBS) {
    const terms = HUB_TO_TAXONOMY[hub]
    if (terms.some((t) => tax.has(t))) out.push(hub)
  }
  return out
}

function mapVendorToRow(v) {
  const loc = (v.location || '').trim()
  const hasCommaState = /,\s*([A-Z]{2})\b/i.test(loc)
  const m = loc.match(/,\s*([A-Z]{2})\b/i)
  const state = m ? m[1].toUpperCase() : null
  const city = loc.includes(',') ? loc.split(',')[0].trim() : null
  const onlineOnly = /^online\b/i.test(loc) || (!hasCommaState && /\bonline\b/i.test(loc))

  return {
    slug: v.slug,
    name: v.name,
    description: (v.story || v.description || '').slice(0, 12000),
    website_url: v.websiteUrl || null,
    city: onlineOnly ? null : city,
    state: onlineOnly ? null : state,
    online_only: onlineOnly,
    meta_title: null,
    meta_description: null,
  }
}

async function main() {
  const dry = process.argv.includes('--dry')
  const vendorsPath = join(root, 'src/data/vendors.js')
  const { getAllVendors } = await import(pathToFileURL(vendorsPath).href)
  const list = getAllVendors()

  console.log(`Found ${list.length} vendors in vendors.js`)
  if (dry) {
    console.log('Dry run — no writes.')
    const sample = list.slice(0, 3).map((v) => ({
      slug: v.slug,
      seoHubs: seoHubTagsFromTaxonomySlugs(v.tagSlugs || []),
    }))
    console.log('Sample inferred SEO tags:', sample)
    process.exit(0)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey)

  const { data: tagRows, error: tagErr } = await supabase.from('vendor_seo_tags').select('id, slug')
  if (tagErr) {
    console.error('Failed to load vendor_seo_tags:', tagErr.message)
    process.exit(1)
  }
  const tagIdBySlug = new Map((tagRows || []).map((r) => [r.slug, r.id]))

  const chunkSize = 15
  let upserted = 0
  let linked = 0

  for (let i = 0; i < list.length; i += chunkSize) {
    const chunk = list.slice(i, i + chunkSize)
    const rows = chunk.map(mapVendorToRow)
    const { data, error } = await supabase.from('vendors').upsert(rows, { onConflict: 'slug' }).select('id, slug')

    if (error) {
      console.error('Upsert error:', error.message)
      process.exit(1)
    }
    upserted += data?.length || 0

    for (const row of data || []) {
      const v = chunk.find((x) => x.slug === row.slug)
      if (!v) continue
      const hubSlugs = seoHubTagsFromTaxonomySlugs(v.tagSlugs || [])

      await supabase.from('vendor_seo_tag_links').delete().eq('vendor_id', row.id)

      const pairs = []
      for (const hs of hubSlugs) {
        const tid = tagIdBySlug.get(hs)
        if (tid) pairs.push({ vendor_id: row.id, tag_id: tid })
      }
      if (pairs.length) {
        const { error: linkErr } = await supabase.from('vendor_seo_tag_links').insert(pairs)
        if (linkErr) {
          console.error('vendor_seo_tag_links insert:', linkErr.message, row.slug)
        } else {
          linked += pairs.length
        }
      }
    }
    process.stdout.write(`\rUpserted ${Math.min(i + chunkSize, list.length)} / ${list.length}`)
  }
  console.log(`\nDone. Upserted ${upserted} vendors, ${linked} tag link rows.`)
  console.log('Optional: set UNIFIED_VENDORS_PREFER_DB=true so DB rows override static for the same slug.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
