import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import {
  formatApplicationPayload,
  mapTrustedRoleQuestion,
  validateQuestionnaireAnswers,
} from '@/lib/dancecard/trustedRoles'
import { getDancecardAdmin, jsonFromRouteError, loadEventBySlug, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const postSchema = z
  .object({
    sceneDisplayName: z.string().min(1).max(200),
    email: z.string().email().max(320).optional().nullable(),
    trustedRoleId: z.string().uuid().optional(),
    applySlug: z.string().min(1).max(64).optional(),
    answers: z.record(z.string().uuid(), z.unknown()).optional(),
    payload: z.record(z.unknown()).optional(),
  })
  .refine((b) => Boolean(b.trustedRoleId || b.applySlug || b.payload), {
    message: 'Select a role to apply for.',
  })

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardPublicForm)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'vetting_applications')
    const body = postSchema.parse(await request.json())

    let trustedRoleId = body.trustedRoleId ?? null
    let payload: Record<string, unknown> = body.payload ?? {}

    if (body.trustedRoleId || body.applySlug) {
      let roleQuery = admin
        .from('dancecard_trusted_roles')
        .select('id, name, status')
        .eq('event_id', event.id)
        .eq('status', 'published')

      if (body.trustedRoleId) {
        roleQuery = roleQuery.eq('id', body.trustedRoleId)
      } else if (body.applySlug) {
        roleQuery = roleQuery.ilike('apply_slug', body.applySlug.trim().toLowerCase())
      }

      const { data: role, error: roleErr } = await roleQuery.maybeSingle()
      if (roleErr) {
        if (/dancecard_trusted_roles|42P01|does not exist/i.test(roleErr.message)) {
          return NextResponse.json({ error: 'Apply migration dancecard_038_trusted_roles.sql first.' }, { status: 409 })
        }
        throw roleErr
      }
      if (!role) {
        return NextResponse.json({ error: 'This position is not accepting applications.' }, { status: 404 })
      }

      trustedRoleId = role.id as string
      const { data: qs, error: qErr } = await admin
        .from('dancecard_trusted_role_questions')
        .select('*')
        .eq('role_id', trustedRoleId)
        .order('sort_order', { ascending: true })
      if (qErr) throw qErr
      const questions = (qs ?? []).map((q) => mapTrustedRoleQuestion(q as Record<string, unknown>))
      const validated = validateQuestionnaireAnswers(questions, body.answers)
      payload = formatApplicationPayload({
        trustedRoleId,
        trustedRoleName: role.name as string,
        answers: validated,
        questions,
      })
    }

    const { data, error } = await admin
      .from('dancecard_vetting_applications')
      .insert({
        event_id: event.id,
        trusted_role_id: trustedRoleId,
        scene_display_name: body.sceneDisplayName.trim(),
        email: body.email?.trim() || null,
        payload,
        status: 'pending',
      })
      .select('id, status, created_at')
      .single()
    if (error) {
      if (/dancecard_vetting_applications|42P01|does not exist/i.test(error.message)) {
        return NextResponse.json({ error: 'Apply migration dancecard_027_phase7_embed_entitlements.sql first.' }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json({ application: data })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Applications closed for this event.' }, { status: 403 })
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg.startsWith('BAD_REQUEST:')) {
      return NextResponse.json({ error: msg.replace(/^BAD_REQUEST:\s*/, '') }, { status: 400 })
    }
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-vetting-applications')
  }
}
