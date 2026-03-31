import type { DiscoveryParsed } from '@/lib/discoverySlug'
import { stateAbbrFromSlug, CITY_BY_SLUG } from '@/lib/discoverySlug'
import type { StateSlug } from '@/lib/eastCoastStates'
import { getAllDungeons } from '@/data/dungeons'

export function listDungeonsForDiscovery(parsed: DiscoveryParsed) {
  const all = getAllDungeons()
  if (parsed.kind === 'special' && parsed.special === 'near_philadelphia') {
    return all.filter(
      (d) =>
        (d.location.state === 'PA' && /philadelphia|philly/i.test(d.location.city)) ||
        (d.location.state === 'NJ' && /camden|cherry/i.test(d.location.city)) ||
        (d.location.state === 'DE' && /wilmington/i.test(d.location.city))
    )
  }
  if (parsed.kind === 'state' || parsed.kind === 'stateTag') {
    const abbr = stateAbbrFromSlug(parsed.stateSlug as StateSlug)
    return all.filter((d) => d.location.state === abbr)
  }
  if (parsed.kind === 'city' || parsed.kind === 'cityTag') {
    const entry = CITY_BY_SLUG[parsed.citySlug]
    if (!entry) return []
    return all.filter(
      (d) => d.location.state === entry.stateAbbr && entry.matchCity(d.location.city)
    )
  }
  return []
}

export function countDungeonsForDiscovery(parsed: DiscoveryParsed): number {
  return listDungeonsForDiscovery(parsed).length
}
