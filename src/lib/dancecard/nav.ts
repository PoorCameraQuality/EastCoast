import { PUBLIC_ATTENDEE_DEMO_SLUG } from '@/lib/dancecard/publicDemo'

/** Legacy PAF sample (`dancecard_seed_paf26_demo.sql`). May require an access code if configured. */
export const DANCECARD_DEFAULT_EVENT_PATH = '/dancecard/paf26'

/** Attendee sandbox — no event code (`npm run dancecard:seed-sandbox`). */
export const DANCECARD_ATTENDEE_SANDBOX_PATH = `/dancecard/${PUBLIC_ATTENDEE_DEMO_SLUG}`

/** Organizer console sandbox (`npm run dancecard:seed-sandbox`). */
export const DANCECARD_ORGANIZER_SANDBOX_PATH = '/organizer/dancecard/sandbox?tab=dashboard'

/** Signed-in organizer hub (create/join real events). */
export const ECKE_EVENT_SYSTEMS_HUB_PATH = '/organizer/dancecard'

export const ECKE_EVENT_SYSTEMS_LOGIN_PATH =
  '/organizer/login?next=%2Forganizer%2Fdancecard'
