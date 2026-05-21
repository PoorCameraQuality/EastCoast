/** Client-safe sandbox demo personas (passwords live server-side only). */

export type SandboxDemoPersonaId = 'alex' | 'brax' | 'casey'

export type SandboxDemoPersona = {
  id: SandboxDemoPersonaId
  username: string
  displayName: string
  role: string
  blurb: string
  tryThese: readonly string[]
}

export const SANDBOX_DEMO_FEATURE_HIGHLIGHTS = [
  'Full weekend program (classes, play, social)',
  'Personal dancecard and availability blocks',
  'Compare mutual free time and reservations',
  'Venue map with room pins',
  'ISO board and attendee directory',
  'Policies and ECKE Sign flow',
  'Staff schedule, shift swaps, and open shifts',
  'Session feedback and schedule change alerts',
] as const

export const SANDBOX_DEMO_PERSONAS: readonly SandboxDemoPersona[] = [
  {
    id: 'alex',
    username: 'sandboxfriend',
    displayName: 'Alex Demo',
    role: 'Weekend attendee',
    blurb: 'Best starting point. Compare with Brax, see a confirmed reservation, and browse the directory.',
    tryThese: ['Compare & reserve', 'Personal dancecard', 'Activity feed'],
  },
  {
    id: 'brax',
    username: 'brax',
    displayName: 'Brax',
    role: 'Staff + compare host',
    blurb: 'Staff tools, share-link demo, pending shift swap, and schedule notifications.',
    tryThese: ['Staff schedule tab', 'Share availability link', 'Shift swaps'],
  },
  {
    id: 'casey',
    username: 'caseydemo',
    displayName: 'Casey Compare',
    role: 'Weekend attendee',
    blurb: 'Another compare partner with blocks already on the calendar.',
    tryThese: ['Compare directory', 'ISO board', 'Map & policies'],
  },
] as const

export function getSandboxDemoPersona(id: string): SandboxDemoPersona | undefined {
  return SANDBOX_DEMO_PERSONAS.find((p) => p.id === id)
}
