export type EventProfileId = 'camp' | 'hotel' | 'party' | 'conference'

export const EVENT_PROFILE_IDS: EventProfileId[] = ['camp', 'hotel', 'party', 'conference']

export type EventProfileLabelKey =
  | 'scheduledItem'
  | 'scheduledItemPlural'
  | 'leadPerson'
  | 'space'
  | 'volunteerBlock'
  | 'addItemCta'

const LABELS: Record<EventProfileId, Record<EventProfileLabelKey, string>> = {
  camp: {
    scheduledItem: 'activity',
    scheduledItemPlural: 'activities',
    leadPerson: 'instructor',
    space: 'room',
    volunteerBlock: 'shift',
    addItemCta: 'Add activity',
  },
  hotel: {
    scheduledItem: 'activity',
    scheduledItemPlural: 'activities',
    leadPerson: 'presenter',
    space: 'room',
    volunteerBlock: 'shift',
    addItemCta: 'Add activity',
  },
  party: {
    scheduledItem: 'activity',
    scheduledItemPlural: 'activities',
    leadPerson: 'host',
    space: 'room',
    volunteerBlock: 'shift',
    addItemCta: 'Add activity',
  },
  conference: {
    scheduledItem: 'activity',
    scheduledItemPlural: 'activities',
    leadPerson: 'speaker',
    space: 'room',
    volunteerBlock: 'shift',
    addItemCta: 'Add activity',
  },
}

export function parseEventProfile(raw: unknown): EventProfileId {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if ((EVENT_PROFILE_IDS as string[]).includes(s)) return s as EventProfileId
  return 'camp'
}

export function labelFor(profile: EventProfileId, key: EventProfileLabelKey): string {
  return LABELS[profile][key]
}

export function profileDisplayName(profile: EventProfileId): string {
  const names: Record<EventProfileId, string> = {
    camp: 'Multi-day camp / retreat',
    hotel: 'Hotel takeover',
    party: 'Single-venue party',
    conference: 'Conference-style',
  }
  return names[profile]
}
