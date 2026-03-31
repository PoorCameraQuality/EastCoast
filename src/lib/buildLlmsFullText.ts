import { EAST_COAST_STATES } from '@/lib/eastCoastStates'
import { venueExportType } from '@/lib/directoryExport'

function stateFullFromAbbr(abbr: string): string | null {
  for (const v of Object.values(EAST_COAST_STATES)) {
    if (v.abbr === abbr) return v.name
  }
  return null
}

/** Plain-text corpus for LLM crawlers: public fields only. */
export function buildLlmsFullText(
  dungeons: Array<Record<string, unknown>>,
  events: Array<Record<string, unknown>>,
  baseUrl: string
): string {
  const today = new Date().toISOString().slice(0, 10)
  const lines: string[] = [
    '# East Coast Kink Events (ECKE) — full directory text export',
    '',
    `last_updated: ${today}`,
    'preferred_citation: East Coast Kink Events (ECKE) — https://www.eastcoastkinkevents.com',
    '',
    '---',
    '',
    '## Venue-style listings (dungeons directory, includes swing clubs and mixed community spaces)',
    '',
  ]

  for (const d of dungeons) {
    const slug = String(d.slug ?? '')
    const name = String(d.name ?? '')
    const loc = (d.location as Record<string, string> | undefined) || {}
    const city = loc.city ?? ''
    const state = loc.state ?? ''
    const address = loc.address ?? ''
    const category = String((d as { category?: string }).category ?? '')
    const excerpt = String((d as { excerpt?: string }).excerpt ?? '')
    const website = String((d as { website?: string }).website ?? '')
    const hours = (d as { hours?: string }).hours
    const contact = (d.contact as Record<string, string> | undefined) || {}
    const email = contact.email ?? (d as { email?: string }).email ?? ''
    const phone = contact.phone ?? (d as { phone?: string }).phone ?? ''
    const social = (d as { socialMedia?: Record<string, string> }).socialMedia
    const vType = venueExportType(category)
    const stFull = stateFullFromAbbr(state)

    lines.push(`### ${name}`)
    lines.push(`slug: ${slug}`)
    lines.push(`type: ${vType}`)
    lines.push(`category: ${category}`)
    lines.push(`city: ${city}`)
    lines.push(`state: ${state}${stFull ? ` (${stFull})` : ''}`)
    if (address) lines.push(`address: ${address}`)
    if (website) lines.push(`website: ${website}`)
    if (email) lines.push(`email: ${email}`)
    if (phone) lines.push(`phone: ${phone}`)
    if (hours) lines.push(`hours: ${hours}`)
    if (social && Object.keys(social).length) {
      lines.push('social:')
      for (const [k, u] of Object.entries(social)) {
        if (u) lines.push(`  ${k}: ${u}`)
      }
    }
    if (excerpt) lines.push(`description: ${excerpt}`)
    lines.push(`ecke_url: ${baseUrl}/dungeons/${slug}`)
    lines.push('')
  }

  lines.push('---', '', '## Events (conventions and major listings)', '')

  for (const e of events) {
    const slug = String(e.slug ?? '')
    const name = String(e.name ?? '')
    const date = (e.date as Record<string, string> | undefined) || {}
    const loc = (e.location as Record<string, string> | undefined) || {}
    const excerpt = String((e as { excerpt?: string }).excerpt ?? '')
    const website = String((e as { website?: string }).website ?? '')
    const venue = String((e as { venue?: string }).venue ?? '')
    const organizer = String((e as { organizer?: string }).organizer ?? '')
    const category = String((e as { category?: string }).category ?? '')

    lines.push(`### ${name}`)
    lines.push(`slug: ${slug}`)
    if (date.start) lines.push(`start_date: ${date.start}`)
    if (date.end) lines.push(`end_date: ${date.end}`)
    lines.push(`city: ${loc.city ?? ''}`)
    lines.push(`state: ${loc.state ?? ''}`)
    if (venue) lines.push(`venue: ${venue}`)
    if (organizer) lines.push(`organizer: ${organizer}`)
    if (category) lines.push(`category: ${category}`)
    if (website) lines.push(`website: ${website}`)
    if (excerpt) lines.push(`description: ${excerpt}`)
    lines.push(`ecke_url: ${baseUrl}/events/${slug}`)
    lines.push('')
  }

  return lines.join('\n')
}
