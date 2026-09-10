/** Region clusters for local-event discovery. Server-safe. */

export const EVENT_REGION_CLUSTERS = {
  'east-coast': {
    label: 'East Coast',
    states: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE', 'MD', 'DC', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL'],
  },
  midwest: {
    label: 'Midwest',
    states: ['OH', 'MI', 'IN', 'IL', 'WI', 'MN', 'IA', 'MO'],
  },
  south: {
    label: 'South Central',
    states: ['TN', 'KY', 'AL', 'MS', 'LA', 'AR', 'OK', 'TX'],
  },
  west: {
    label: 'West',
    states: ['CO', 'NM', 'AZ', 'UT', 'NV', 'CA', 'OR', 'WA', 'ID', 'MT', 'WY', 'AK', 'HI'],
  },
  canada: {
    label: 'Canada',
    states: ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'],
  },
} as const

export type EventRegionClusterId = keyof typeof EVENT_REGION_CLUSTERS

export const EVENT_REGION_STORAGE_KEY = 'ecke-events-region'

const TIMEZONE_CLUSTER: Array<{ match: RegExp; cluster: EventRegionClusterId }> = [
  { match: /^America\/(New_York|Toronto|Montreal|Nipigon|Thunder_Bay|Iqaluit|Pangnirtung|Glace_Bay|Halifax|Moncton|Goose_Bay|Blanc-Sablon)/i, cluster: 'east-coast' },
  { match: /^America\/(Chicago|Winnipeg|Rainy_River|Rankin_Inlet|Resolute|Matamoros|Menominee|North_Dakota)/i, cluster: 'midwest' },
  { match: /^America\/(Denver|Boise|Phoenix|Los_Angeles|Vancouver|Whitehorse|Dawson|Edmonton|Cambridge_Bay|Inuvik|Creston|Dawson_Creek|Fort_Nelson|Hermosillo|Tijuana)/i, cluster: 'west' },
]

export function timezoneToEventRegionCluster(timeZone: string): EventRegionClusterId {
  for (const row of TIMEZONE_CLUSTER) {
    if (row.match.test(timeZone)) return row.cluster
  }
  return 'east-coast'
}

/** State abbreviations this location filter should include, or null to use substring match. */
export function expandEventRegionFilter(raw?: string | null): string[] | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  const cluster = EVENT_REGION_CLUSTERS[trimmed.toLowerCase() as EventRegionClusterId]
  if (cluster) return [...cluster.states]
  const abbr = trimmed.toUpperCase()
  if (/^[A-Z]{2}$/.test(abbr)) return [abbr]
  return null
}

export function eventMatchesRegion(stateAbbr: string, locationFilter?: string | null): boolean {
  if (!locationFilter) return false
  const states = expandEventRegionFilter(locationFilter)
  if (states) return states.includes(stateAbbr.toUpperCase())
  const q = locationFilter.toLowerCase()
  return stateAbbr.toLowerCase().includes(q)
}
