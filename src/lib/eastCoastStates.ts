import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'

/** Single source for state hub slugs (index + detail + sitemap). */
export const EAST_COAST_STATES = {
  'new-york': { name: 'New York', abbr: 'NY', region: 'Northeast', emoji: '🗽' },
  pennsylvania: { name: 'Pennsylvania', abbr: 'PA', region: 'Mid-Atlantic', emoji: '🔔' },
  'new-jersey': { name: 'New Jersey', abbr: 'NJ', region: 'Mid-Atlantic', emoji: '🏖️' },
  maryland: { name: 'Maryland', abbr: 'MD', region: 'Mid-Atlantic', emoji: '🦀' },
  delaware: { name: 'Delaware', abbr: 'DE', region: 'Mid-Atlantic', emoji: '🏛️' },
  virginia: { name: 'Virginia', abbr: 'VA', region: 'South', emoji: '🏔️' },
  'north-carolina': { name: 'North Carolina', abbr: 'NC', region: 'South', emoji: '🏝️' },
  'south-carolina': { name: 'South Carolina', abbr: 'SC', region: 'South', emoji: '🌴' },
  georgia: { name: 'Georgia', abbr: 'GA', region: 'South', emoji: '🍑' },
  florida: { name: 'Florida', abbr: 'FL', region: 'South', emoji: '🌞' },
  tennessee: { name: 'Tennessee', abbr: 'TN', region: 'South', emoji: '🎸' },
  louisiana: { name: 'Louisiana', abbr: 'LA', region: 'South', emoji: '🎷' },
  maine: { name: 'Maine', abbr: 'ME', region: 'New England', emoji: '🦞' },
  vermont: { name: 'Vermont', abbr: 'VT', region: 'New England', emoji: '🍁' },
  'new-hampshire': { name: 'New Hampshire', abbr: 'NH', region: 'New England', emoji: '⛰️' },
  massachusetts: { name: 'Massachusetts', abbr: 'MA', region: 'New England', emoji: '🎓' },
  'rhode-island': { name: 'Rhode Island', abbr: 'RI', region: 'New England', emoji: '⚓' },
  connecticut: { name: 'Connecticut', abbr: 'CT', region: 'New England', emoji: '🌳' },
  'washington-dc': { name: 'Washington DC', abbr: 'DC', region: 'Mid-Atlantic', emoji: '🏛️' },
  ohio: { name: 'Ohio', abbr: 'OH', region: 'Midwest', emoji: '🌰' },
  michigan: { name: 'Michigan', abbr: 'MI', region: 'Midwest', emoji: '🧤' },
  illinois: { name: 'Illinois', abbr: 'IL', region: 'Midwest', emoji: '🌽' },
  indiana: { name: 'Indiana', abbr: 'IN', region: 'Midwest', emoji: '🏁' },
  missouri: { name: 'Missouri', abbr: 'MO', region: 'Midwest', emoji: '🧭' },
  texas: { name: 'Texas', abbr: 'TX', region: 'South Central', emoji: '🤠' },
  oklahoma: { name: 'Oklahoma', abbr: 'OK', region: 'South Central', emoji: '🌾' },
  iowa: { name: 'Iowa', abbr: 'IA', region: 'Midwest', emoji: '🦬' },
  nebraska: { name: 'Nebraska', abbr: 'NE', region: 'Great Plains', emoji: '🐂' },
  colorado: { name: 'Colorado', abbr: 'CO', region: 'Mountain West', emoji: '🏔️' },
  california: { name: 'California', abbr: 'CA', region: 'Pacific', emoji: '🐻' },
  washington: { name: 'Washington', abbr: 'WA', region: 'Pacific', emoji: '🌲' },
  oregon: { name: 'Oregon', abbr: 'OR', region: 'Pacific', emoji: '🌲' },
  arizona: { name: 'Arizona', abbr: 'AZ', region: 'Southwest', emoji: '🌵' },
  nevada: { name: 'Nevada', abbr: 'NV', region: 'Southwest', emoji: '🎰' },
  utah: { name: 'Utah', abbr: 'UT', region: 'Mountain West', emoji: '⛰️' },
  montana: { name: 'Montana', abbr: 'MT', region: 'Mountain West', emoji: '🏔️' },
  wyoming: { name: 'Wyoming', abbr: 'WY', region: 'Mountain West', emoji: '🦬' },
  idaho: { name: 'Idaho', abbr: 'ID', region: 'Mountain West', emoji: '🥔' },
  'new-mexico': { name: 'New Mexico', abbr: 'NM', region: 'Southwest', emoji: '🌶️' },
  alaska: { name: 'Alaska', abbr: 'AK', region: 'Pacific', emoji: '❄️' },
  hawaii: { name: 'Hawaii', abbr: 'HI', region: 'Pacific', emoji: '🌺' },
} as const

export type StateSlug = keyof typeof EAST_COAST_STATES

/** Matches states/[state] metadata: index when combined upcoming events + dungeons >= 2. */
export function getStateHubListingTotal(abbr: string): number {
  const now = new Date()
  const events = getAllEvents().filter(
    (e) => e.location.state === abbr && new Date(e.date.end) >= now
  ).length
  const dungeons = getAllDungeons().filter((d) => d.location.state === abbr).length
  return events + dungeons
}

/** State URLs to include in sitemap (skip thin hubs that are noindex). */
export function getStateSlugsForSitemap(): string[] {
  return (Object.keys(EAST_COAST_STATES) as StateSlug[]).filter(
    (slug) => getStateHubListingTotal(EAST_COAST_STATES[slug].abbr) >= 2
  )
}
