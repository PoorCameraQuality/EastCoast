import type { SupabaseClient } from '@supabase/supabase-js'
import { createSignedStorageUrl, DANCECARD_EVENT_ASSETS_BUCKET } from '@/lib/dancecard/dancecardStorage'

/** Print-quality badge logo (signed storage URL), then event logo_url fallback. */
export async function resolveBadgeLogoUrl(
  admin: SupabaseClient,
  event: { badge_logo_path?: string | null; logo_url?: string | null },
  expiresSec = 3600,
): Promise<string | null> {
  const path = (event.badge_logo_path as string | null)?.trim()
  if (path) {
    const signed = await createSignedStorageUrl(admin, path, DANCECARD_EVENT_ASSETS_BUCKET, expiresSec)
    if (signed) return signed
  }
  const external = (event.logo_url as string | null)?.trim()
  return external || null
}
