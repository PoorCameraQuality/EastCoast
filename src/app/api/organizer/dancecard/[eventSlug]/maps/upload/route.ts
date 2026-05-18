import { NextRequest, NextResponse } from 'next/server'

import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

import { DANCECARD_MAPS_BUCKET, sanitizeMapObjectName } from '@/lib/dancecard/dancecardMapsConstants'

import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'



export const dynamic = 'force-dynamic'

export const runtime = 'nodejs'



const MAX_MAP_BYTES = 8 * 1024 * 1024



const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp'])



function sniffImageMime(buf: Buffer): string | null {

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

  return null

}



export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {

  try {

    const ctx = await requireOrganizerForSlug(context.params.eventSlug)

    assertOrganizerCanMutate(ctx)

    const { admin, eventId } = ctx

    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)

    if (!event || event.id !== eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 })



    const form = await request.formData()

    const file = form.get('file')

    if (!file || !(file instanceof Blob)) {

      return NextResponse.json({ error: 'Expected multipart field "file"' }, { status: 400 })

    }

    const buf = Buffer.from(await file.arrayBuffer())

    if (buf.length > MAX_MAP_BYTES) {

      return NextResponse.json({ error: 'File too large (max 8 MB)' }, { status: 400 })

    }

    const sniffed = sniffImageMime(buf)

    if (!sniffed || !ALLOWED_MIME.has(sniffed)) {

      return NextResponse.json({ error: 'Only PNG, JPEG, or WebP images are allowed' }, { status: 400 })

    }

    const rawName = (file as File).name || 'map.png'

    const path = `${eventId}/${crypto.randomUUID()}-${sanitizeMapObjectName(rawName)}`



    const { error } = await admin.storage.from(DANCECARD_MAPS_BUCKET).upload(path, buf, {

      contentType: sniffed,

      upsert: true,

    })

    if (error) {

      return NextResponse.json(

        {

          error: `Storage upload failed. Create bucket "${DANCECARD_MAPS_BUCKET}" in Supabase and grant service role upload.`,

        },

        { status: 503 },

      )

    }

    return NextResponse.json({ path })

  } catch (e) {

    return organizerErrorResponse(e)

  }

}

