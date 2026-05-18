export type DancecardEventMeta = {
  productTitle: string
  eventTitle: string
  subtitle: string | null
  timezone: string
  windowStartsAt: string
  windowEndsAt: string
  sharedByLabel: string
  sharedByDetail: string | null
  logoUrl: string | null
}

export function eventWindowLabel(
  meta: Pick<DancecardEventMeta, 'timezone' | 'windowStartsAt' | 'windowEndsAt'> | null,
): string {
  if (!meta) return ''
  const fmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: meta.timezone || 'America/New_York',
  })
  return `${fmt.format(new Date(meta.windowStartsAt))} to ${fmt.format(new Date(meta.windowEndsAt))}`
}

export function resolveEventDisplayTitles(
  meta: DancecardEventMeta | null | undefined,
  slugFallback: string,
): { productTitle: string; eventTitle: string; subtitle: string } {
  const productTitle = meta?.productTitle?.trim() || 'Dancecard'
  const eventTitle = meta?.eventTitle?.trim() || productTitle || slugFallback
  const subtitle =
    meta?.subtitle?.trim() ||
    'Sign in to manage your availability, compare schedules with friends, and reserve time for this event.'
  return { productTitle, eventTitle, subtitle }
}
