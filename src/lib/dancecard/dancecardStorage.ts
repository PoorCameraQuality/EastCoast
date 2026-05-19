import type { SupabaseClient } from '@supabase/supabase-js'

/** Venue floor plans and map pin images. */
export const DANCECARD_MAPS_BUCKET = process.env.DANCECARD_MAPS_BUCKET ?? 'dancecard-maps'

/** Organizer event branding (badge print logos, etc.). */
export const DANCECARD_EVENT_ASSETS_BUCKET =
  process.env.DANCECARD_EVENT_ASSETS_BUCKET ?? 'dancecard-event-assets'

/** Attendee profile avatars (per-account, event-scoped paths). */
export const DANCECARD_PROFILE_PHOTOS_BUCKET =
  process.env.DANCECARD_PROFILE_PHOTOS_BUCKET ?? 'dancecard-profile-photos'

/**
 * Pre-split bucket. Signed-URL resolution tries the primary bucket first, then this one.
 * Defaults to `dancecard-maps` so objects uploaded before the split keep working.
 */
export const DANCECARD_LEGACY_STORAGE_BUCKET =
  process.env.DANCECARD_LEGACY_STORAGE_BUCKET ?? DANCECARD_MAPS_BUCKET

export const DANCECARD_STORAGE_BUCKETS = [
  DANCECARD_MAPS_BUCKET,
  DANCECARD_EVENT_ASSETS_BUCKET,
  DANCECARD_PROFILE_PHOTOS_BUCKET,
] as const

export function sanitizeStorageObjectName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120) || 'file.bin'
}

/** @deprecated use sanitizeStorageObjectName */
export const sanitizeMapObjectName = sanitizeStorageObjectName

export function primaryBucketForStoragePath(path: string): string {
  if (path.includes('/profile-photos/')) return DANCECARD_PROFILE_PHOTOS_BUCKET
  if (path.includes('badge-logo')) return DANCECARD_EVENT_ASSETS_BUCKET
  return DANCECARD_MAPS_BUCKET
}

export async function createSignedStorageUrl(
  admin: SupabaseClient,
  path: string,
  primaryBucket: string,
  expiresSec = 3600,
): Promise<string | null> {
  const trimmed = path.trim()
  if (!trimmed) return null

  const buckets: string[] = [primaryBucket]
  if (DANCECARD_LEGACY_STORAGE_BUCKET && DANCECARD_LEGACY_STORAGE_BUCKET !== primaryBucket) {
    buckets.push(DANCECARD_LEGACY_STORAGE_BUCKET)
  }

  for (const bucket of buckets) {
    const { data, error } = await admin.storage.from(bucket).createSignedUrl(trimmed, expiresSec)
    if (data?.signedUrl) return data.signedUrl
    if (error) {
      const msg = (error as { message?: string }).message ?? ''
      if (/not found|404|does not exist/i.test(msg)) continue
    }
  }
  return null
}

export function storageSetupHint(bucket: string): string {
  return `Create Supabase Storage bucket "${bucket}" and grant the service role upload + signed URL access.`
}
