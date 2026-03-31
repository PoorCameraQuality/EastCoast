import type { ParsedVendorDiscovery } from '@/lib/parseVendorDiscoverySlug'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { VENDOR_SEO_HUB_LABELS, type VendorSeoHubTagSlug } from '@/lib/vendorHubTagMap'

/** Short city blurbs for hub copy (SEO context, not exhaustive). */
const STATE_CITY_BLURB: Partial<Record<StateSlug, string>> = {
  'new-jersey': 'communities from Newark and Jersey City to the Shore',
  pennsylvania: 'Philadelphia, Pittsburgh, and the wider Keystone State',
  'new-york': 'New York City, Buffalo, Rochester, and upstate scenes',
  delaware: 'Wilmington, Dover, and the First State kink community',
  maryland: 'Baltimore, the DC suburbs, and the Chesapeake region',
  virginia: 'Northern Virginia, Richmond, and Hampton Roads',
  'north-carolina': 'Charlotte, the Triangle, and the Piedmont',
  'south-carolina': 'Charleston, Columbia, and the Upstate',
  georgia: 'Atlanta and Savannah hubs',
  florida: 'Miami, Orlando, Tampa, and the Gulf Coast',
}

function majorCitiesForState(slug: StateSlug): string {
  return (
    STATE_CITY_BLURB[slug] ||
    `kink-positive makers and retailers connected to ${EAST_COAST_STATES[slug].name}`
  )
}

function tagLabel(slug: VendorSeoHubTagSlug): string {
  return VENDOR_SEO_HUB_LABELS[slug]
}

type BuildArgs = {
  parsed: Extract<ParsedVendorDiscovery, { kind: 'hub' }>
  vendorCount: number
  year: number
}

/**
 * Long-form intro (several hundred words) for vendor discovery hubs.
 */
export function buildVendorDiscoveryIntro(args: BuildArgs): { h1: string; paragraphs: string[] } {
  const { parsed, vendorCount, year } = args
  const countLine =
    vendorCount === 0
      ? 'We are growing this directory; check back as new makers join.'
      : `This hub currently highlights ${vendorCount} listing${vendorCount === 1 ? '' : 's'} that match your filters—paid supporters and community vendors alike.`

  if (parsed.variant === 'online') {
    const h1 = `Online kink vendors & BDSM gear (${year})`
    const paragraphs = [
      `Shopping for kink gear online is how many people first connect with quality makers, independent leather workers, silicone artisans, and curated boutiques. The East Coast Kink Events marketplace brings together vendors who ship across the United States—whether they run a standalone store, an Etsy shop, or a small-batch studio with made-to-order lead times. ${countLine}`,
      `When you buy from independent vendors, you often get clearer communication about materials, care, and customization. Many of our listed shops offer custom orders, ready-to-ship staples, or education alongside products. Use the tag filters on the main vendors page to narrow by play style, materials, or maker type, then visit each profile for website links and story-driven descriptions.`,
      `Community safety and consent culture matter here: we list vendors as a discovery aid, not an endorsement of every product. Always follow local laws, negotiate scenes clearly, and prioritize body-safe materials and proper technique—especially for bondage, impact, and insertables. For in-person shopping, browse state hubs to find makers tied to a region; for events, pair this directory with our BDSM events calendar and regional discovery pages.`,
      `Bookmark this hub if you want a single place to restart your search for online kink retailers, gear drops, and artisan-made toys. We refresh listings as vendors onboard and as seasonal collections ship—ideal if you are building a kit, replacing a favorite flogger, or exploring a new material like latex or rope.`,
    ]
    return { h1, paragraphs }
  }

  if (parsed.variant === 'state') {
    const st = parsed.stateSlug
    const { name: stateName } = EAST_COAST_STATES[st]
    const cities = majorCitiesForState(st)
    const h1 = `BDSM & kink vendors in ${stateName}`
    const paragraphs = [
      `${stateName} is home to makers, resellers, and educators who serve ${cities}. Some operate brick-and-mortar or studio spaces; others ship nationally while keeping roots in the local scene. This page gathers profiles that list a ${stateName} address or strong regional tie, plus select online-only shops that commonly serve buyers in the area. ${countLine}`,
      `Regional shopping can mean faster pickup at events, less shipping uncertainty for fragile pieces, and relationships with craftspeople who understand humid summers, cold winters, or urban studio constraints. Profiles include tag-based specialties—impact, rope, leather, silicone, fetish wear—so you can align purchases with your play style and budget.`,
      `We built this hub for ${year} discovery: whether you are new and comparing first collars, or experienced and looking for a custom harness or dungeon furniture referral. Cross-check classes and socials on our events listings; many vendors teach workshops or vend at regional cons.`,
      `If you are a maker in ${stateName} who wants to be listed, reach out via the site contact form. Consent-forward commerce matters: verify product fit, follow care instructions, and support shops that are transparent about materials and production timelines.`,
    ]
    return { h1, paragraphs }
  }

  if (parsed.variant === 'tag') {
    const label = tagLabel(parsed.seoTagSlug)
    const h1 = `Kink vendors: ${label}`
    const paragraphs = [
      `This topic hub focuses on ${label}. Vendors tag themselves using a detailed taxonomy; we map those tags into broader themes so you can browse without learning every slug. You will see independent artisans, curated shops, and educators who stock or make relevant gear. ${countLine}`,
      `Material choices matter: leather ages differently than latex; rope fiber changes handling; impact toys vary from stingy to thuddy. Read each vendor story for how they test, source, and finish work. Supporter listings may include additional product imagery when you filter by tag—helpful when comparing similar items.`,
      `Pair this hub with state pages to find makers near you, or with online vendors for shipping-friendly orders. For community connection, explore BDSM events by region and weekend—many vendors offer event pickup or pop-ups.`,
      `We update the directory as new shops join. If you represent a business that fits this category, consider onboarding through our vendor programs so the community can find you alongside these ${year} listings.`,
    ]
    return { h1, paragraphs }
  }

  if (parsed.variant === 'stateTag') {
    const st = parsed.stateSlug
    const { name: stateName } = EAST_COAST_STATES[st]
    const label = tagLabel(parsed.seoTagSlug)
    const cities = majorCitiesForState(st)
    const h1 = `${label} in ${stateName} — kink vendors`
    const paragraphs = [
      `Looking for ${label} with a ${stateName} connection? This combined hub lists vendors tagged for that specialty who either operate in-state—serving ${cities}—or ship online while matching your filter. It is a narrower slice of the marketplace meant for regional buyers who already know the play style they want. ${countLine}`,
      `Local pickup and event vending can reduce shipping risk for delicate pieces; online options expand inventory when you need a specific size, color, or custom commission. Compare profiles, visit websites, and note whether vendors highlight workshop education or custom order windows.`,
      `Safety and skill development go hand in hand: especially for bondage, impact, and insertables, seek resources, classes, and peer mentorship. Our events discovery pages list classes and parties where you can learn before you invest in gear.`,
      `Directory listings evolve throughout ${year}. Bookmark the main vendors index for tag-wide browsing, or jump to neighboring states from related links below when you want to expand your search radius.`,
    ]
    return { h1, paragraphs }
  }

  throw new Error('Unreachable vendor hub variant')
}
