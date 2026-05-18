const GUIDE_IDS = [
  'compare',
  'program-rehearsal',
  'conflict-uni',
  'safety-quest',
  'setup-runway',
  'happening-now',
] as const

export type GuideId = (typeof GUIDE_IDS)[number]

export type DeepGuideParam = 'registration' | 'program' | 'vetting' | 'integrations' | 'conflicts'

export const DEEP_GUIDE_TABS: Record<DeepGuideParam, import('@/components/dancecard/organizer/shell/organizerNavConfig').OrganizerTab> = {
  registration: 'settings',
  program: 'program',
  vetting: 'vetting',
  integrations: 'integrations',
  conflicts: 'program',
}

export function guideStorageKey(eventSlug: string, guideId: GuideId) {
  return `dc-guide:${eventSlug.toLowerCase()}:${guideId}`
}
