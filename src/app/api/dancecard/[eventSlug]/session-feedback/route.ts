import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { loadSelections } from '@/lib/dancecard/data'

export const dynamic = 'force-dynamic'

type FeedbackConfig = {
  enabled?: boolean
  opensAt?: string | null
  closesAt?: string | null
  anonymous?: boolean
}

function parseFeedbackConfig(raw: unknown): FeedbackConfig {
  if (!raw || typeof raw !== 'object') return { enabled: false }
  const o = raw as Record<string, unknown>
  return {
    enabled: Boolean(o.enabled),
    opensAt: typeof o.opensAt === 'string' ? o.opensAt : null,
    closesAt: typeof o.closesAt === 'string' ? o.closesAt : null,
    anonymous: Boolean(o.anonymous),
  }
}

function feedbackWindowOpen(config: FeedbackConfig): boolean {
  if (!config.enabled) return false
  const now = Date.now()
  if (config.opensAt && Date.parse(config.opensAt) > now) return false
  if (config.closesAt && Date.parse(config.closesAt) < now) return false
  return true
}

const postSchema = z.object({
  programSlotId: z.string().uuid(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
})

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'session_feedback')

    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const config = parseFeedbackConfig((event as { feedback_config?: unknown }).feedback_config)
    const open = feedbackWindowOpen(config)

    const selections = await loadSelections(admin, session.accountId)
    const programSlotIds = selections.filter((s) => s.kind === 'program' && s.slot_id).map((s) => s.slot_id as string)

    const { data: existing } = await admin
      .from('dancecard_session_feedback')
      .select('program_slot_id, rating, comment, created_at')
      .eq('event_id', event.id)
      .eq('account_id', session.accountId)
    const submitted = new Set((existing ?? []).map((r) => r.program_slot_id as string))

    return NextResponse.json({
      open,
      config: { enabled: config.enabled, anonymous: config.anonymous },
      pendingSlotIds: open ? programSlotIds.filter((id) => !submitted.has(id)) : [],
      submitted: existing ?? [],
    })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Session feedback not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'session-feedback-get')
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'session_feedback')

    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const config = parseFeedbackConfig((event as { feedback_config?: unknown }).feedback_config)
    if (!feedbackWindowOpen(config)) {
      return NextResponse.json({ error: 'Feedback is not open' }, { status: 403 })
    }

    const body = postSchema.parse(await request.json())

    const selections = await loadSelections(admin, session.accountId)
    const attended = selections.some((s) => s.kind === 'program' && s.slot_id === body.programSlotId)
    if (!attended) {
      return NextResponse.json({ error: 'You can only rate sessions on your schedule' }, { status: 400 })
    }

    const { error } = await admin.from('dancecard_session_feedback').upsert(
      {
        event_id: event.id,
        account_id: session.accountId,
        program_slot_id: body.programSlotId,
        rating: body.rating ?? null,
        comment: body.comment?.trim() || null,
      },
      { onConflict: 'event_id,account_id,program_slot_id' }
    )
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Session feedback not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'session-feedback-post')
  }
}
