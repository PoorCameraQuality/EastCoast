import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerPolicyAcceptanceRecordSchema } from '@/lib/dancecard/organizerSchemas'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = organizerPolicyAcceptanceRecordSchema.parse(await request.json())
    const { data: reg, error: rErr } = await admin
      .from('dancecard_registrants')
      .select('id')
      .eq('id', body.registrantId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (rErr) throw rErr
    if (!reg) return NextResponse.json({ error: 'Registrant not found' }, { status: 404 })
    const { data: pol, error: pErr } = await admin
      .from('dancecard_policy_documents')
      .select('id')
      .eq('id', body.policyDocumentId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (pErr) throw pErr
    if (!pol) return NextResponse.json({ error: 'Policy document not found' }, { status: 404 })
    const { error } = await admin.from('dancecard_registrant_policy_acceptances').insert({
      registrant_id: body.registrantId,
      policy_document_id: body.policyDocumentId,
      accepted_at: new Date().toISOString(),
    })
    if (error) {
      const code = (error as { code?: string }).code
      if (code === '23505') {
        return NextResponse.json({ ok: true, duplicate: true })
      }
      throw error
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
