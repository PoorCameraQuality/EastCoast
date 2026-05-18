import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerTrustedRolePatchSchema } from '@/lib/dancecard/organizerSchemas'
import { mapTrustedRoleQuestion, mapTrustedRoleRow, syncTrustedRoleQuestions } from '@/lib/dancecard/trustedRoles'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const ROLE_SELECT = 'id, name, apply_slug, description, status, intro_text, confirmation_text, sort_order, created_at, updated_at'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; roleId: string } },
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const event = await loadEventBySlugAnyStatus(ctx.admin, context.params.eventSlug)
    if (!event || event.id !== ctx.eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const roleId = context.params.roleId
    const { data: existing, error: exErr } = await ctx.admin
      .from('dancecard_trusted_roles')
      .select('id')
      .eq('id', roleId)
      .eq('event_id', ctx.eventId)
      .maybeSingle()
    if (exErr) throw exErr
    if (!existing) return NextResponse.json({ error: 'Role not found' }, { status: 404 })

    const body = organizerTrustedRolePatchSchema.parse(await request.json())
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.name !== undefined) patch.name = body.name.trim()
    if (body.applySlug !== undefined) patch.apply_slug = body.applySlug
    if (body.description !== undefined) patch.description = body.description
    if (body.status !== undefined) patch.status = body.status
    if (body.introText !== undefined) patch.intro_text = body.introText
    if (body.confirmationText !== undefined) patch.confirmation_text = body.confirmationText
    if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder

    if (Object.keys(patch).length > 1) {
      const { error } = await ctx.admin
        .from('dancecard_trusted_roles')
        .update(patch)
        .eq('id', roleId)
        .eq('event_id', ctx.eventId)
      if (error) {
        if (/unique|duplicate/i.test(error.message)) {
          return NextResponse.json({ error: 'Apply link slug already in use for this event.' }, { status: 409 })
        }
        throw error
      }
    }

    if (body.questions) {
      await syncTrustedRoleQuestions(ctx.admin, roleId, body.questions)
    }

    const { data: row, error: loadErr } = await ctx.admin
      .from('dancecard_trusted_roles')
      .select(ROLE_SELECT)
      .eq('id', roleId)
      .single()
    if (loadErr) throw loadErr
    const { data: qs, error: qErr } = await ctx.admin
      .from('dancecard_trusted_role_questions')
      .select('*')
      .eq('role_id', roleId)
      .order('sort_order', { ascending: true })
    if (qErr) throw qErr

    return NextResponse.json({
      role: mapTrustedRoleRow(
        row as Record<string, unknown>,
        (qs ?? []).map((q) => mapTrustedRoleQuestion(q as Record<string, unknown>)),
      ),
    })
  } catch (e) {
    if (e instanceof ZodError) {
      const flat = e.flatten()
      const fieldMsgs = Object.entries(flat.fieldErrors).flatMap(([k, v]) =>
        (v ?? []).map((m) => `${k}: ${m}`),
      )
      const message = fieldMsgs[0] ?? flat.formErrors[0] ?? 'Validation error'
      return NextResponse.json({ error: message, details: flat }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: { eventSlug: string; roleId: string } },
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { data, error } = await ctx.admin
      .from('dancecard_trusted_roles')
      .delete()
      .eq('id', context.params.roleId)
      .eq('event_id', ctx.eventId)
      .select('id')
    if (error) throw error
    if (!data?.length) return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
