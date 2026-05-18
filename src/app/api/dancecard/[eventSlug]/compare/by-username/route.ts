import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug, resolveAccountFromSession } from '@/lib/dancecard/routeCommon'
import { usernameSchema } from '@/lib/dancecard/schemas'
import { resolveCompareUsername } from '@/lib/dancecard/mutualHostResolve'
import { buildMutualSharePayload } from '@/lib/dancecard/mutualSharePayload'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  username: usernameSchema,
})

export async function POST(
  request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  const limited = await withRateLimit(request, rateLimiters.dancecardCompare)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const { eventSlug } = context.params
    const slug = normalizeEventSlug(eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { username } = bodySchema.parse(await request.json())

    const resolved = await resolveCompareUsername(admin, event.id, username, session.accountId)
    if (!resolved.ok) {
      if (resolved.reason === 'self') {
        return NextResponse.json(
          { error: 'You cannot compare with your own username. Enter another attendee or use a share link.' },
          { status: 400 },
        )
      }
      return NextResponse.json({ error: 'Compare not available for that username.' }, { status: 404 })
    }
    const hostId = resolved.hostId

    const { data: host, error: hErr } = await admin
      .from('dancecard_accounts')
      .select('id, display_name, username, event_id')
      .eq('id', hostId)
      .maybeSingle()
    if (hErr || !host || host.event_id !== event.id) {
      return NextResponse.json({ error: 'Compare not available for that username.' }, { status: 404 })
    }

    const viewerPayload = {
      accountId: session.accountId,
      displayName: session.displayName,
      username: session.username,
    }
    const payload = await buildMutualSharePayload(
      admin,
      event,
      {
        id: host.id,
        display_name: host.display_name as string,
        username: host.username as string,
      },
      viewerPayload
    )

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
      },
    })
  } catch (e) {
    return jsonFromRouteError(e, 'compare-by-username')
  }
}
