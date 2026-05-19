import { NextRequest, NextResponse } from 'next/server'
import {
  assertOrganizerCanMutate,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { getDancecardAdmin, loadEventBySlugAnyStatus, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { isMissingTable } from '@/lib/dancecard/supabaseColumnFallback'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  try {
    const slug = normalizeEventSlug(context.params.eventSlug)
    const { eventId } = await requireOrganizerForSlug(slug)
    const admin = getDancecardAdmin()
    const event = await loadEventBySlugAnyStatus(admin, slug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data, error } = await admin
      .from('dancecard_iso_posts')
      .select(
        'id, title, body, visibility, status, curated_pin, created_at, account_id, dancecard_accounts(display_name, username)'
      )
      .eq('event_id', eventId)
      .order('curated_pin', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) {
      if (isMissingTable(error, 'dancecard_iso_posts')) {
        return NextResponse.json(
          {
            error: 'ISO board tables are missing. Apply migration dancecard_049_iso_board.sql.',
            needsMigration: 'dancecard_049_iso_board.sql',
          },
          { status: 409 },
        )
      }
      throw error
    }

    const posts = (data ?? []).map((p) => {
      const a = p.dancecard_accounts as
        | { display_name?: string; username?: string }
        | { display_name?: string; username?: string }[]
        | null
      const acc = Array.isArray(a) ? a[0] : a
      return {
        id: p.id,
        title: p.title,
        visibility: p.visibility,
        status: p.status,
        curatedPin: p.curated_pin,
        authorSceneName: acc?.display_name ?? '',
        authorUsername: acc?.username ?? '',
      }
    })

    return NextResponse.json({ posts })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  try {
    const slug = normalizeEventSlug(context.params.eventSlug)
    const ctx = await requireOrganizerForSlug(slug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, slug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = (await request.json()) as {
      postId?: string
      curatedPin?: boolean
      visibility?: string
      status?: string
    }
    if (!body.postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.curatedPin !== undefined) patch.curated_pin = body.curatedPin
    if (body.visibility) patch.visibility = body.visibility
    if (body.status) patch.status = body.status

    const { data: updated, error } = await admin
      .from('dancecard_iso_posts')
      .update(patch)
      .eq('id', body.postId)
      .eq('event_id', eventId)
      .select('id')
      .maybeSingle()
    if (error) {
      if (isMissingTable(error, 'dancecard_iso_posts')) {
        return NextResponse.json(
          {
            error: 'ISO board tables are missing. Apply migration dancecard_049_iso_board.sql.',
            needsMigration: 'dancecard_049_iso_board.sql',
          },
          { status: 409 },
        )
      }
      throw error
    }
    if (!updated) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
