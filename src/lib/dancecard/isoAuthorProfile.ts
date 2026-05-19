import type { SupabaseClient } from '@supabase/supabase-js'
import { parseAttendeeProfileConfig, type AttendeePublicProfile } from '@/lib/dancecard/attendeeProfile'
import { buildPublicProfileResolved } from '@/lib/dancecard/profilePhotoUrl'
import { loadPrefs } from '@/lib/dancecard/data'

export async function loadIsoAuthorProfiles(
  admin: SupabaseClient,
  accountIds: string[],
  attendeeProfileConfig: unknown,
): Promise<Map<string, AttendeePublicProfile>> {
  const config = parseAttendeeProfileConfig(attendeeProfileConfig)
  const unique = Array.from(new Set(accountIds.filter(Boolean)))
  const out = new Map<string, AttendeePublicProfile>()
  if (!unique.length) return out

  const { data: accounts } = await admin
    .from('dancecard_accounts')
    .select('id, display_name, username')
    .in('id', unique)

  await Promise.all(
    (accounts ?? []).map(async (a) => {
      const id = a.id as string
      const prefs = await loadPrefs(admin, id)
      out.set(
        id,
        await buildPublicProfileResolved(admin, {
          displayName: (a.display_name as string) ?? 'Attendee',
          username: (a.username as string) ?? '',
          stored: prefs.profile,
          config,
        }),
      )
    }),
  )

  return out
}
