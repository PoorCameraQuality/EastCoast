import { normalizeEventSlug } from '@/lib/dancecard/slug'

/** Seeded demo event slug (`npm run dancecard:seed-sandbox`). */
export const PUBLIC_SANDBOX_SLUG = 'sandbox'

/** Attendee + organizer demos share this event. */
export const PUBLIC_ATTENDEE_DEMO_SLUG = PUBLIC_SANDBOX_SLUG

export function isPublicSandboxSlug(eventSlug: string): boolean {
  return normalizeEventSlug(eventSlug) === PUBLIC_SANDBOX_SLUG
}

export function isPublicAttendeeDemoSlug(eventSlug: string): boolean {
  return isPublicSandboxSlug(eventSlug)
}

/**
 * Public unauthenticated sandbox demos (attendee + organizer).
 * - Opt in with `DANCECARD_PUBLIC_SANDBOX_DEMO=1`
 * - Opt out with `=0`
 * - Default: on in local/preview, **off in Vercel Production** (avoids open organizer APIs).
 */
export function publicSandboxDemoEnabled(): boolean {
  const flag = process.env.DANCECARD_PUBLIC_SANDBOX_DEMO
  if (flag === '0') return false
  if (flag === '1') return true
  return process.env.VERCEL_ENV !== 'production'
}

/** @deprecated Use {@link publicSandboxDemoEnabled}. */
export const publicSandboxOrganizerDemoEnabled = publicSandboxDemoEnabled

/** No event password on the public sandbox; explore without an access code. */
export function allowPublicAttendeeDemoAccess(eventSlug: string): boolean {
  return publicSandboxDemoEnabled() && isPublicAttendeeDemoSlug(eventSlug)
}

export function allowPublicSandboxOrganizerAccess(eventSlug: string): boolean {
  return publicSandboxDemoEnabled() && isPublicSandboxSlug(eventSlug)
}
