import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerTrustedRoleCreateSchema } from '@/lib/dancecard/organizerSchemas'
import {
  applySlugFromName,
  mapTrustedRoleQuestion,
  mapTrustedRoleRow,
  syncTrustedRoleQuestions,
} from '@/lib/dancecard/trustedRoles'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const ROLE_SELECT = 'id, name, apply_slug, description, status, intro_text, confirmation_text, sort_order, created_at, updated_at'

async function loadRolesWithQuestions(
  admin: Awaited<ReturnType<typeof requireOrganizerForSlug>>['admin'],
  eventId: string,
) {
  const { data: roles, error } = await admin
    .from('dancecard_trusted_roles')
    .select(ROLE_SELECT)
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) {
    if (/dancecard_trusted_roles|42P01|does not exist/i.test(error.message)) {
      return { roles: [], needsMigration: true as const }
    }
    throw error
  }
  const roleIds = (roles ?? []).map((r) => r.id as string)
  if (!roleIds.length) return { roles: [], needsMigration: false as const }

  const { data: qs, error: qErr } = await admin
    .from('dancecard_trusted_role_questions')
    .select('*')
    .in('role_id', roleIds)
    .order('sort_order', { ascending: true })
  if (qErr) throw qErr

  const byRole = new Map<string, ReturnType<typeof mapTrustedRoleQuestion>[]>()
  for (const q of qs ?? []) {
    const rid = q.role_id as string
    const list = byRole.get(rid) ?? []
    list.push(mapTrustedRoleQuestion(q as Record<string, unknown>))
    byRole.set(rid, list)
  }

  return {
    needsMigration: false as const,
    roles: (roles ?? []).map((r) => mapTrustedRoleRow(r as Record<string, unknown>, byRole.get(r.id as string) ?? [])),
  }
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(ctx.admin, context.params.eventSlug)
    if (!event || event.id !== ctx.eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { roles, needsMigration } = await loadRolesWithQuestions(ctx.admin, ctx.eventId)
    return NextResponse.json({ roles, needsMigration })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const event = await loadEventBySlugAnyStatus(ctx.admin, context.params.eventSlug)
    if (!event || event.id !== ctx.eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = organizerTrustedRoleCreateSchema.parse(await request.json())
    const applySlug = body.applySlug ?? applySlugFromName(body.name)

    const { data: row, error } = await ctx.admin
      .from('dancecard_trusted_roles')
      .insert({
        event_id: ctx.eventId,
        name: body.name.trim(),
        apply_slug: applySlug,
        description: body.description ?? null,
        status: body.status ?? 'draft',
        intro_text: body.introText ?? '',
        confirmation_text: body.confirmationText ?? '',
        sort_order: body.sortOrder ?? 0,
      })
      .select(ROLE_SELECT)
      .single()
    if (error) {
      if (/unique|duplicate/i.test(error.message)) {
        return NextResponse.json({ error: 'Apply link slug already in use for this event.' }, { status: 409 })
      }
      if (/dancecard_trusted_roles|42P01|does not exist/i.test(error.message)) {
        return NextResponse.json({ error: 'Apply migration dancecard_038_trusted_roles.sql first.' }, { status: 409 })
      }
      throw error
    }

    if (body.questions?.length) {
      await syncTrustedRoleQuestions(ctx.admin, row.id as string, body.questions)
    }

    const { data: qs } = await ctx.admin
      .from('dancecard_trusted_role_questions')
      .select('*')
      .eq('role_id', row.id)
      .order('sort_order', { ascending: true })

    return NextResponse.json({
      role: mapTrustedRoleRow(
        row as Record<string, unknown>,
        (qs ?? []).map((q) => mapTrustedRoleQuestion(q as Record<string, unknown>)),
      ),
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
