import { NextRequest, NextResponse } from 'next/server'
import { parseAttendeeProfileConfig } from '@/lib/dancecard/attendeeProfile'
import {
  DANCECARD_PROFILE_PHOTOS_BUCKET,
  sanitizeStorageObjectName,
  storageSetupHint,
} from '@/lib/dancecard/dancecardStorage'
import { loadPrefs, saveAccountProfile } from '@/lib/dancecard/data'
import { mergeProfileStored } from '@/lib/dancecard/attendeeProfile'
import {
  buildPublicProfileResolved,
  formatProfilePhotoStorageRef,
} from '@/lib/dancecard/profilePhotoUrl'
import {
  extensionForProfilePhotoMime,
  validateProfilePhotoBuffer,
} from '@/lib/dancecard/profilePhotoUpload'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  dancecardSessionUnauthorizedResponse,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.uploads)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return dancecardSessionUnauthorizedResponse()

    const attendeeProfileConfig = parseAttendeeProfileConfig(
      (event as { attendee_profile_config?: unknown }).attendee_profile_config,
    )
    if (!attendeeProfileConfig.photo) {
      return NextResponse.json({ error: 'Profile photos are disabled for this event' }, { status: 403 })
    }

    const form = await request.formData()
    const file = form.get('file')
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Expected multipart field "file"' }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    const validated = validateProfilePhotoBuffer(buf)
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 })
    }

    const ext = extensionForProfilePhotoMime(validated.mime)
    const rawName = (file as File).name || `profile${ext}`
    const path = `${event.id}/profile-photos/${session.accountId}/${sanitizeStorageObjectName(rawName)}`

    const { error: upErr } = await admin.storage.from(DANCECARD_PROFILE_PHOTOS_BUCKET).upload(path, buf, {
      contentType: validated.mime,
      upsert: true,
    })
    if (upErr) {
      return NextResponse.json(
        {
          error: `Storage upload failed. ${storageSetupHint(DANCECARD_PROFILE_PHOTOS_BUCKET)}`,
        },
        { status: 503 },
      )
    }

    const photoRef = formatProfilePhotoStorageRef(path)
    const current = await loadPrefs(admin, session.accountId)
    const merged = mergeProfileStored(current.profile, { photoUrl: photoRef })
    const saveRes = await saveAccountProfile(admin, session.accountId, merged)
    if (!saveRes.ok) {
      return NextResponse.json(
        {
          error:
            'Database is missing column dancecard_prefs.profile_json. Apply migration dancecard_039_attendee_profile.sql.',
        },
        { status: 503 },
      )
    }

    const publicProfile = await buildPublicProfileResolved(admin, {
      displayName: session.displayName,
      username: session.username,
      stored: merged,
      config: attendeeProfileConfig,
    })

    return NextResponse.json({
      photoUrl: photoRef,
      previewUrl: publicProfile.avatarUrl ?? null,
      publicProfile,
    })
  } catch (e) {
    return jsonFromRouteError(e, 'profile-photo-upload')
  }
}
