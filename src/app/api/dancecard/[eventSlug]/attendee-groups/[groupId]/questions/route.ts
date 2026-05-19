import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getMembership, isGroupAdmin } from '@/lib/dancecard/attendeeGroupsCore'
import { putQuestionsSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string } },
) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const { group } = await loadGroupForEvent(ctx.admin, context.params.groupId, ctx.event.id)
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

    const { data, error } = await ctx.admin
      .from('dancecard_attendee_group_questions')
      .select('id, sort_order, prompt, kind, options_json, required')
      .eq('group_id', context.params.groupId)
      .order('sort_order', { ascending: true })
    if (error) {
      if ((error as { code?: string }).code === '42P01') return NextResponse.json({ questions: [] })
      throw error
    }

    const questions = (data ?? []).map((q) => ({
      id: q.id as string,
      sortOrder: q.sort_order as number,
      prompt: q.prompt as string,
      kind: q.kind as string,
      options: (q.options_json as string[]) ?? [],
      required: Boolean(q.required),
    }))

    return NextResponse.json({ questions })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-questions-get')
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string } },
) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { group } = await loadGroupForEvent(ctx.admin, context.params.groupId, ctx.event.id)
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

    const membership = await getMembership(ctx.admin, context.params.groupId, ctx.session.accountId)
    if (!isGroupAdmin(membership?.role)) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    const body = putQuestionsSchema.parse(await request.json())
    await ctx.admin.from('dancecard_attendee_group_questions').delete().eq('group_id', context.params.groupId)

    if (body.questions.length) {
      const rows = body.questions.map((q, i) => ({
        group_id: context.params.groupId,
        sort_order: q.sortOrder ?? i,
        prompt: q.prompt.trim(),
        kind: q.kind,
        options_json: q.options ?? [],
        required: q.required ?? true,
      }))
      const { error } = await ctx.admin.from('dancecard_attendee_group_questions').insert(rows)
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-questions-put')
  }
}
