import { NextRequest, NextResponse } from 'next/server'
import {
  assertOrganizerCanMutate,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import {
  DANCECARD_EVENT_ASSETS_BUCKET,
  sanitizeStorageObjectName,
  storageSetupHint,
} from '@/lib/dancecard/dancecardStorage'
import { resolveBadgeLogoUrl } from '@/lib/dancecard/badgeLogoUrl'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const MAX_BYTES = 12 * 1024 * 1024

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])

function sniffMime(buf: Buffer): string | null {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'image/png'
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp'
  }
  const head = buf.subarray(0, Math.min(buf.length, 512)).toString('utf8').trimStart()
  if (head.startsWith('<svg') || head.includes('<svg')) {
    return 'image/svg+xml'
  }
  return null
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const form = await request.formData()
    const file = form.get('file')
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Expected multipart field "file"' }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    if (buf.length > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 12 MB)' }, { status: 400 })
    }

    const sniffed = sniffMime(buf)
    if (!sniffed || !ALLOWED.has(sniffed)) {
      return NextResponse.json({ error: 'Use PNG, JPEG, WebP, or SVG for the badge logo' }, { status: 400 })
    }

    const ext =
      sniffed === 'image/png'
        ? '.png'
        : sniffed === 'image/jpeg'
          ? '.jpg'
          : sniffed === 'image/webp'
            ? '.webp'
            : '.svg'
    const rawName = (file as File).name || `badge-logo${ext}`
    const path = `${eventId}/badge-logo-${sanitizeStorageObjectName(rawName)}`

    const { error: upErr } = await admin.storage.from(DANCECARD_EVENT_ASSETS_BUCKET).upload(path, buf, {
      contentType: sniffed,
      upsert: true,
    })
    if (upErr) {
      return NextResponse.json(
        {
          error: `Storage upload failed. ${storageSetupHint(DANCECARD_EVENT_ASSETS_BUCKET)}`,
        },
        { status: 503 },
      )
    }

    const { error: dbErr } = await admin
      .from('dancecard_events')
      .update({ badge_logo_path: path })
      .eq('id', eventId)
    if (dbErr) {
      if (/badge_logo_path/i.test(dbErr.message)) {
        return NextResponse.json(
          { error: 'Apply migration dancecard_052_badge_logo.sql before uploading a badge logo.' },
          { status: 503 },
        )
      }
      throw dbErr
    }

    const badgeLogoUrl = await resolveBadgeLogoUrl(admin, { badge_logo_path: path, logo_url: event.logo_url })

    return NextResponse.json({ path, badgeLogoUrl })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
