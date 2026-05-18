import { parseAgreementsConfig, type AgreementsConfig } from '@/lib/dancecard/agreementsConfig'
import { parseAttendeeGuideJson, type AttendeeGuideJson } from '@/lib/dancecard/attendeeGuideJson'
import { parseAttendeeProfileConfig, type AttendeeProfileConfig } from '@/lib/dancecard/attendeeProfile'
import { parseEventProfile, type EventProfileId } from '@/lib/dancecard/eventProfile'
import { parseThemeConfig, type DancecardThemeConfig } from '@/lib/dancecard/theme'

export type OrganizerEventDto = {
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
  themeConfig: DancecardThemeConfig
  eventProfile: EventProfileId
  attendeeGuideJson: AttendeeGuideJson
  agreementsConfig: AgreementsConfig
  attendeeProfileConfig: AttendeeProfileConfig
}

export function organizerEventDtoFromRow(row: Record<string, unknown>): OrganizerEventDto {
  return {
    id: String(row.id),
    slug: String(row.slug),
    productTitle: String(row.product_title ?? ''),
    eventTitle: String(row.event_title ?? ''),
    subtitle: (row.subtitle as string | null) ?? null,
    timezone: String(row.timezone ?? 'America/New_York'),
    windowStartsAt: String(row.window_starts_at),
    windowEndsAt: String(row.window_ends_at),
    sharedByLabel: String(row.shared_by_label ?? ''),
    sharedByDetail: (row.shared_by_detail as string | null) ?? null,
    logoUrl: (row.logo_url as string | null) ?? null,
    status: String(row.status ?? 'draft'),
    staffAccessCode: String(row.staff_access_code ?? ''),
    registrationAccessCode: String(row.registration_access_code ?? ''),
    badgeLayoutJson: (row.badge_layout_json as Record<string, unknown>) ?? {},
    themeConfig: parseThemeConfig(row.theme_config),
    eventProfile: parseEventProfile(row.event_profile),
    attendeeGuideJson: parseAttendeeGuideJson(row.attendee_guide_json),
    agreementsConfig: parseAgreementsConfig(row.agreements_config),
    attendeeProfileConfig: parseAttendeeProfileConfig(row.attendee_profile_config),
  }
}
