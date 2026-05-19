import type { SupabaseClient } from '@supabase/supabase-js'
import { assertHttpsImageUrl } from '@/lib/security/safeUrl'
import {
  buildPublicProfile,
  type AttendeeProfileConfig,
  type AttendeeProfileStored,
  type AttendeePublicProfile,
} from '@/lib/dancecard/attendeeProfile'
import { isProfilePhotoStorageRef, profilePhotoStoragePath } from '@/lib/dancecard/profilePhotoConstants'
import {
  createSignedStorageUrl,
  DANCECARD_PROFILE_PHOTOS_BUCKET,
} from '@/lib/dancecard/dancecardStorage'

export { PROFILE_PHOTO_STORAGE_PREFIX, formatProfilePhotoStorageRef } from '@/lib/dancecard/profilePhotoConstants'

export async function resolveStoredProfilePhoto(
  admin: SupabaseClient,
  photoUrl: string | null | undefined,
  expiresSec = 3600,
): Promise<string | null> {
  if (!photoUrl?.trim()) return null
  const raw = photoUrl.trim()
  if (isProfilePhotoStorageRef(raw)) {
    const path = profilePhotoStoragePath(raw)
    return createSignedStorageUrl(admin, path, DANCECARD_PROFILE_PHOTOS_BUCKET, expiresSec)
  }
  return assertHttpsImageUrl(raw)
}

export async function buildPublicProfileResolved(
  admin: SupabaseClient,
  input: {
    displayName: string
    username: string
    stored: AttendeeProfileStored
    config: AttendeeProfileConfig
  },
): Promise<AttendeePublicProfile> {
  const resolvedPhotoUrl = await resolveStoredProfilePhoto(admin, input.stored.photoUrl)
  return buildPublicProfile({ ...input, resolvedPhotoUrl })
}
