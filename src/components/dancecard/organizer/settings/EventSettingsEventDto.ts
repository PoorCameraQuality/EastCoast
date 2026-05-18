import type { AgreementsConfig } from '@/lib/dancecard/agreementsConfig'
import type { AttendeeProfileConfig } from '@/lib/dancecard/attendeeProfile'
import type { AttendeeGuideJson } from '@/lib/dancecard/attendeeGuideJson'
import type { EventProfileId } from '@/lib/dancecard/eventProfile'
import type { DancecardThemeConfig } from '@/lib/dancecard/theme'

export type EventSettingsEventDto = {
  id: string
  slug: string
  productTitle: string
  eventTitle: string
  subtitle: string | null
  timezone: string
  windowStartsAt: string
  windowEndsAt: string
  sharedByLabel: string
  sharedByDetail: string | null
  logoUrl: string | null
  status: string
  staffAccessCode: string
  registrationAccessCode: string
  badgeLayoutJson: Record<string, unknown>
  themeConfig?: DancecardThemeConfig
  eventProfile: EventProfileId
  attendeeGuideJson: AttendeeGuideJson
  agreementsConfig: AgreementsConfig
  attendeeProfileConfig: AttendeeProfileConfig
}

export function toLocalDatetimeInput(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function hasEventWindow(event: EventSettingsEventDto) {
  return Boolean(event.windowStartsAt && event.windowEndsAt)
}
