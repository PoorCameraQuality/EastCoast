import type { StateSlug } from '@/lib/eastCoastStates'

/** Neighboring state hubs for cross-linking on detail pages. */
export const STATE_NEIGHBORS: Partial<Record<StateSlug, StateSlug[]>> = {
  'new-jersey': ['pennsylvania', 'new-york', 'delaware'],
  pennsylvania: ['new-jersey', 'new-york', 'maryland', 'ohio', 'west-virginia', 'delaware'],
  'new-york': ['new-jersey', 'pennsylvania', 'connecticut', 'massachusetts', 'vermont'],
  delaware: ['pennsylvania', 'new-jersey', 'maryland'],
  maryland: ['pennsylvania', 'virginia', 'delaware', 'washington-dc', 'west-virginia'],
  'washington-dc': ['maryland', 'virginia'],
  virginia: ['maryland', 'north-carolina', 'washington-dc', 'west-virginia', 'tennessee'],
  'north-carolina': ['virginia', 'south-carolina', 'georgia', 'tennessee'],
  'south-carolina': ['north-carolina', 'georgia', 'florida'],
  georgia: ['florida', 'north-carolina', 'south-carolina', 'tennessee', 'alabama'],
  florida: ['georgia', 'south-carolina', 'alabama'],
  tennessee: ['kentucky', 'virginia', 'north-carolina', 'georgia', 'alabama', 'mississippi', 'arkansas', 'missouri'],
  ohio: ['pennsylvania', 'west-virginia', 'kentucky', 'indiana', 'michigan'],
  illinois: ['indiana', 'wisconsin', 'iowa', 'missouri', 'kentucky', 'michigan'],
  michigan: ['ohio', 'indiana', 'wisconsin', 'illinois'],
  texas: ['oklahoma', 'louisiana', 'arkansas', 'new-mexico'],
  california: ['nevada', 'arizona', 'oregon'],
  nevada: ['california', 'arizona', 'utah', 'oregon'],
  colorado: ['wyoming', 'nebraska', 'kansas', 'oklahoma', 'new-mexico', 'utah'],
  massachusetts: ['new-york', 'connecticut', 'rhode-island', 'new-hampshire', 'vermont'],
  connecticut: ['new-york', 'massachusetts', 'rhode-island'],
}

export function getNearbyStateSlugs(slug: StateSlug, limit = 6): StateSlug[] {
  const neighbors = STATE_NEIGHBORS[slug]
  if (neighbors?.length) return neighbors.slice(0, limit)
  return []
}
